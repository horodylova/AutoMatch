import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

type Raw = Record<string, string | null>;

const report = {
  total: 0,
  inserted: 0,
  skipped: [] as { id: string; reason: string }[],
  nulled: {} as Record<string, number>,
};

function noteNull(field: string) {
  report.nulled[field] = (report.nulled[field] || 0) + 1;
}

function text(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const t = v.replace(/\r/g, "").trim();
  return t === "" || t === "N/A" || t === "-" ? null : t;
}

function int(v: string | null | undefined, field: string): number | null {
  const t = text(v);
  if (t === null) return null;
  const cleaned = t.replace(/[$,\s]/g, "");
  const m = cleaned.match(/-?\d+/);
  if (!m) { noteNull(field); return null; }
  const n = parseInt(m[0], 10);
  if (!Number.isFinite(n)) { noteNull(field); return null; }
  return n;
}

function float(v: string | null | undefined, field: string): number | null {
  const t = text(v);
  if (t === null) return null;
  const cleaned = t.replace(/[$,\s]/g, "");
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (!m) { noteNull(field); return null; }
  const n = parseFloat(m[0]);
  if (!Number.isFinite(n)) { noteNull(field); return null; }
  return n;
}

function date(v: string | null | undefined): Date | null {
  const t = text(v);
  if (t === null) return null;
  const m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!m) { noteNull("dateAdded"); return null; }
  const month = MONTHS[m[2]];
  if (month === undefined) { noteNull("dateAdded"); return null; }
  return new Date(Date.UTC(parseInt(m[3], 10), month, parseInt(m[1], 10)));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildLookup(
  values: string[],
  create: (name: string, slug: string) => Promise<{ id: number; name: string }>
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const seen = new Set<string>();
  const slugs = new Set<string>();
  for (const v of values) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    let slug = slugify(v);
    if (slug === "") slug = `item-${seen.size}`;
    let unique = slug;
    let n = 2;
    while (slugs.has(unique)) unique = `${slug}-${n++}`;
    slugs.add(unique);
    const row = await create(v, unique);
    map.set(v, row.id);
  }
  return map;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("Reading source table...");
  const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'teo' AND table_name = 'teo_cars' ORDER BY ordinal_position"
  );
  const quoted = cols.map(c => `"${c.column_name.replace(/"/g, '""')}"`).join(", ");
  const rows = await prisma.$queryRawUnsafe<Raw[]>(`SELECT ${quoted} FROM teo.teo_cars`);
  report.total = rows.length;
  console.log(`Found ${rows.length} rows, ${cols.length} columns`);

  const get = (r: Raw, key: string): string | null => {
    if (key in r) return r[key];
    const found = Object.keys(r).find(k => k.replace(/\r/g, "").trim() === key);
    return found ? r[found] : null;
  };

  if (dryRun) {
    console.log("\nDry run: parsing only, nothing written.\n");
    for (const r of rows) {
      const id = text(get(r, "ID"));
      if (!id) { report.skipped.push({ id: "(no id)", reason: "missing ID" }); continue; }
      const make = text(get(r, "Make"));
      const model = text(get(r, "Model"));
      const year = int(get(r, "Year"), "year");
      if (!make) { report.skipped.push({ id, reason: "missing Make" }); continue; }
      if (!model) { report.skipped.push({ id, reason: "missing Model" }); continue; }
      if (year === null) { report.skipped.push({ id, reason: "unparseable Year" }); continue; }
      int(get(r, "Base MSRP"), "basePrice");
      int(get(r, "Horsepower (HP)"), "horsepower");
      int(get(r, "EPA combined MPG"), "mpgCombined");
      int(get(r, "EPA combined MPGe"), "mpgeCombined");
      int(get(r, "Total seating"), "seating");
      date(get(r, "Date added"));
      report.inserted++;
    }
    printReport();
    return;
  }

  console.log("Clearing target tables...");
  await prisma.catalogSpec.deleteMany();
  await prisma.catalogCar.deleteMany();
  await prisma.catalogModel.deleteMany();
  await prisma.make.deleteMany();
  await prisma.bodyType.deleteMany();
  await prisma.fuelType.deleteMany();
  await prisma.driveType.deleteMany();
  await prisma.transmission.deleteMany();
  await prisma.engineType.deleteMany();

  console.log("Building lookups...");
  const makeMap = await buildLookup(
    rows.map(r => text(get(r, "Make"))).filter(Boolean) as string[],
    (name, slug) => prisma.make.create({ data: { name, slug } })
  );
  const bodyMap = await buildLookup(
    rows.map(r => text(get(r, "Body type"))).filter(Boolean) as string[],
    (name, slug) => prisma.bodyType.create({ data: { name, slug } })
  );
  const fuelMap = await buildLookup(
    rows.map(r => text(get(r, "Fuel type"))).filter(Boolean) as string[],
    (name, slug) => prisma.fuelType.create({ data: { name, slug } })
  );
  const driveMap = await buildLookup(
    rows.map(r => text(get(r, "Drive type"))).filter(Boolean) as string[],
    (name, slug) => prisma.driveType.create({ data: { name, slug } })
  );
  const transMap = await buildLookup(
    rows.map(r => text(get(r, "Transmission"))).filter(Boolean) as string[],
    (name, slug) => prisma.transmission.create({ data: { name, slug } })
  );

  const engineMap = await buildLookup(
    rows.map(r => text(get(r, "Engine type"))).filter(Boolean) as string[],
    (name, slug) => prisma.engineType.create({ data: { name, slug } })
  );

  const modelMap = new Map<string, number>();
  const modelSeen = new Set<string>();
  for (const r of rows) {
    const make = text(get(r, "Make"));
    const model = text(get(r, "Model"));
    if (!make || !model) continue;
    const key = `${make}|||${model}`;
    if (modelSeen.has(key)) continue;
    modelSeen.add(key);
    const makeId = makeMap.get(make);
    if (makeId === undefined) continue;
    const created = await prisma.catalogModel.create({
      data: { name: model, slug: slugify(`${make}-${model}`), makeId },
    });
    modelMap.set(key, created.id);
  }

  console.log(`Lookups: ${makeMap.size} makes, ${modelMap.size} models, ${bodyMap.size} bodies, ${fuelMap.size} fuels, ${driveMap.size} drives, ${transMap.size} transmissions, ${engineMap.size} engine types`);

  console.log("Inserting cars...");
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const cars: object[] = [];
    const specs: object[] = [];

    for (const r of chunk) {
      const id = text(get(r, "ID"));
      if (!id) { report.skipped.push({ id: "(no id)", reason: "missing ID" }); continue; }
      const make = text(get(r, "Make"));
      const model = text(get(r, "Model"));
      const year = int(get(r, "Year"), "year");
      if (!make) { report.skipped.push({ id, reason: "missing Make" }); continue; }
      if (!model) { report.skipped.push({ id, reason: "missing Model" }); continue; }
      if (year === null) { report.skipped.push({ id, reason: "unparseable Year" }); continue; }

      const makeId = makeMap.get(make);
      const modelId = modelMap.get(`${make}|||${model}`);
      if (makeId === undefined || modelId === undefined) {
        report.skipped.push({ id, reason: "lookup miss" });
        continue;
      }

      const body = text(get(r, "Body type"));
      const fuel = text(get(r, "Fuel type"));
      const drive = text(get(r, "Drive type"));
      const trans = text(get(r, "Transmission"));
      const engine = text(get(r, "Engine type"));

      cars.push({
        id,
        makeId,
        modelId,
        bodyTypeId: body ? bodyMap.get(body) ?? null : null,
        fuelTypeId: fuel ? fuelMap.get(fuel) ?? null : null,
        driveTypeId: drive ? driveMap.get(drive) ?? null : null,
        transmissionId: trans ? transMap.get(trans) ?? null : null,
        engineTypeId: engine ? engineMap.get(engine) ?? null : null,
        year,
        trim: text(get(r, "Trim")),
        basePrice: int(get(r, "Base MSRP"), "basePrice"),
        horsepower: int(get(r, "Horsepower (HP)"), "horsepower"),
        cylinders: text(get(r, "Cylinder")),
        seating: int(get(r, "Total seating"), "seating"),
        mpgCombined: int(get(r, "EPA combined MPG"), "mpgCombined"),
        mpgeCombined: int(get(r, "EPA combined MPGe"), "mpgeCombined"),
        imageUrl: text(get(r, "Image URL")),
      });

      specs.push({
        carId: id,
        trimDescription: text(get(r, "Trim (description)")),
        baseInvoice: int(get(r, "Base Invoice"), "baseInvoice"),
        colorsExterior: text(get(r, "Colors exterior")),
        colorsInterior: text(get(r, "Colors interior")),
        doors: int(get(r, "Door"), "doors"),
        lengthIn: float(get(r, "Length (in)"), "lengthIn"),
        widthIn: float(get(r, "Width (in)"), "widthIn"),
        heightIn: float(get(r, "Height (in)"), "heightIn"),
        wheelbaseIn: float(get(r, "Wheelbase (in)"), "wheelbaseIn"),
        frontTrackIn: float(get(r, "Front track (in)"), "frontTrackIn"),
        rearTrackIn: float(get(r, "Rear track (in)"), "rearTrackIn"),
        groundClearanceIn: float(get(r, "Ground clearance (in)"), "groundClearanceIn"),
        angleOfApproach: float(get(r, "Angle of approach (degrees)"), "angleOfApproach"),
        angleOfDeparture: float(get(r, "Angle of departure (degrees)"), "angleOfDeparture"),
        turningCircleFt: float(get(r, "Turning circle (ft)"), "turningCircleFt"),
        dragCoefficient: float(get(r, "Drag coefficient (Cd)"), "dragCoefficient"),
        epaInteriorVolumeCuFt: float(get(r, "EPA interior volume (cu ft)"), "epaInteriorVolumeCuFt"),
        cargoCapacityCuFt: float(get(r, "Cargo capacity (cu ft)"), "cargoCapacityCuFt"),
        maxCargoCapacityCuFt: float(get(r, "Maximum cargo capacity (cu ft)"), "maxCargoCapacityCuFt"),
        curbWeightLbs: int(get(r, "Curb weight (lbs)"), "curbWeightLbs"),
        grossWeightLbs: int(get(r, "Gross weight (lbs)"), "grossWeightLbs"),
        maxPayloadLbs: int(get(r, "Maximum payload (lbs)"), "maxPayloadLbs"),
        maxTowingCapacityLbs: int(get(r, "Maximum towing capacity (lbs)"), "maxTowingCapacityLbs"),
        engineSizeL: float(get(r, "Engine size (l)"), "engineSizeL"),
        horsepowerRpm: int(get(r, "Horsepower (rpm)"), "horsepowerRpm"),
        torqueFtLbs: int(get(r, "Torque (ft-lbs)"), "torqueFtLbs"),
        torqueRpm: int(get(r, "Torque (rpm)"), "torqueRpm"),
        valve: text(get(r, "Valve")),
        valveTiming: text(get(r, "Valve timing")),
        camType: text(get(r, "Cam type")),
        engineType: text(get(r, "Engine type")),
        fuelTankCapacityGal: float(get(r, "Fuel tank capacity (gal)"), "fuelTankCapacityGal"),
        epaCityHighwayMpg: text(get(r, "EPA city/highway MPG")),
        rangeMilesCityHwy: text(get(r, "Range in miles (city/hwy)")),
        epaCityHighwayMpge: text(get(r, "EPA city/highway MPGe")),
        electricRange: text(get(r, "Electric Range")),
        epaElectricityRange: text(get(r, "EPA electricity range")),
        epaKwhPer100Mi: text(get(r, "EPA kWh/100 mi")),
        epaTimeToChargeAt240V: text(get(r, "EPA time to charge battery (at 240V)")),
        batteryCapacity: text(get(r, "Battery capacity")),
        costToDrive: text(get(r, "Cost to Drive")),
        fastChargePortType: text(get(r, "Fast-charge port type")),
        countryOfFinalAssembly: text(get(r, "Country of final assembly")),
        countryOfOrigin: text(get(r, "Country of origin")),
        carClassification: text(get(r, "Car classification")),
        platformCode: text(get(r, "Platform code / generation number")),
        frontHeadRoomIn: float(get(r, "Front head room (in)"), "frontHeadRoomIn"),
        frontHipRoomIn: float(get(r, "Front hip room (in)"), "frontHipRoomIn"),
        frontLegRoomIn: float(get(r, "Front leg room (in)"), "frontLegRoomIn"),
        frontShoulderRoomIn: float(get(r, "Front shoulder room (in)"), "frontShoulderRoomIn"),
        rearHeadRoomIn: float(get(r, "Rear head room (in)"), "rearHeadRoomIn"),
        rearHipRoomIn: float(get(r, "Rear hip room (in)"), "rearHipRoomIn"),
        rearLegRoomIn: float(get(r, "Rear leg room (in)"), "rearLegRoomIn"),
        rearShoulderRoomIn: float(get(r, "Rear shoulder room (in)"), "rearShoulderRoomIn"),
        warrantyBasic: text(get(r, "Basic")),
        warrantyDrivetrain: text(get(r, "Drivetrain")),
        warrantyRoadside: text(get(r, "Roadside assistance")),
        warrantyRust: text(get(r, "Rust")),
        sourceUrl: text(get(r, "Source URL")),
        review: text(get(r, "Review")),
        pro: text(get(r, "Pro")),
        con: text(get(r, "Con")),
        whatsNew: text(get(r, "What's new")),
        nhtsaOverallRating: text(get(r, "NHTSA Overall Rating")),
        newPriceRange: text(get(r, "New price range")),
        usedPriceRange: text(get(r, "Used price range")),
        scorecardOverall: float(get(r, "Scorecard Overall"), "scorecardOverall"),
        scorecardDriving: float(get(r, "Scorecard Driving"), "scorecardDriving"),
        scorecardComfort: float(get(r, "Scorecard Confort"), "scorecardComfort"),
        scorecardInterior: float(get(r, "Scorecard Interior"), "scorecardInterior"),
        scorecardUtility: float(get(r, "Scorecard Utility"), "scorecardUtility"),
        scorecardTechnology: float(get(r, "Scorecard Technology"), "scorecardTechnology"),
        dateAdded: date(get(r, "Date added")),
      });
    }

    if (cars.length > 0) {
      await prisma.catalogCar.createMany({ data: cars as never, skipDuplicates: true });
      await prisma.catalogSpec.createMany({ data: specs as never, skipDuplicates: true });
      report.inserted += cars.length;
    }
    process.stdout.write(`\r  ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }
  console.log("");
  printReport();
}

function printReport() {
  console.log("\n=== MIGRATION REPORT ===");
  console.log(`Source rows:   ${report.total}`);
  console.log(`Migrated:      ${report.inserted}`);
  console.log(`Skipped:       ${report.skipped.length}`);

  if (report.skipped.length > 0) {
    const byReason: Record<string, number> = {};
    for (const s of report.skipped) byReason[s.reason] = (byReason[s.reason] || 0) + 1;
    console.log("\nSkipped by reason:");
    for (const [reason, count] of Object.entries(byReason)) {
      console.log(`  ${reason}: ${count}`);
    }
    console.log("\nFirst 10 skipped IDs:");
    for (const s of report.skipped.slice(0, 10)) console.log(`  ${s.id} — ${s.reason}`);
  }

  const nulled = Object.entries(report.nulled).sort((a, b) => b[1] - a[1]);
  if (nulled.length > 0) {
    console.log("\nFields set to null (value present but unparseable):");
    for (const [field, count] of nulled) {
      const pct = ((count / report.total) * 100).toFixed(1);
      console.log(`  ${field}: ${count} (${pct}%)`);
    }
  }
  console.log("");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
