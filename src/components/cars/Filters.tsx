"use client";
import { Button } from "@progress/kendo-react-buttons";
import { Input, Checkbox, Switch } from "@progress/kendo-react-inputs";
import FilterSection from "./FilterSection";
import styles from "./cars.module.css";

export default function Filters() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>Filters</div>
      <div className={styles.panelBody}>
        <FilterSection title="Search">
          <Input placeholder="Search make, model, trim" />
        </FilterSection>
        <FilterSection title="Price">
          <Input type="number" placeholder="Min" />
          <Input type="number" placeholder="Max" />
        </FilterSection>
        <FilterSection title="Body type">
          <Checkbox label="Sedan" />
          <Checkbox label="SUV" />
          <Checkbox label="Truck" />
          <Checkbox label="Coupe" />
        </FilterSection>
        <FilterSection title="Fuel">
          <Checkbox label="Gasoline" />
          <Checkbox label="Diesel" />
          <Checkbox label="Hybrid" />
          <Checkbox label="Electric" />
        </FilterSection>
        <FilterSection title="New only">
          <Switch />
        </FilterSection>
        <div style={{ display: "flex", gap: 8 }}>
          <Button themeColor="primary">Apply</Button>
          <Button>Reset</Button>
        </div>
      </div>
    </div>
  );
}
