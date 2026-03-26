 "use client";

 import { useState } from "react";
 import Link from "next/link";
 import styles from "../dealers.module.css";
 import Toast, { ToastType } from "@/components/Toast";
 
 type Term = 1 | 3 | 6 | 12;
 
 function calculatePrice(term: Term) {
   return 150 * term;
 }
 
 export default function DealerOrderPage() {
   const [toast, setToast] = useState<{ message: string; type: ToastType; title?: string } | null>(null);
   const [termMonths, setTermMonths] = useState<Term>(1);
   const [isHomeNet, setIsHomeNet] = useState(false);
   const [homeNetId, setHomeNetId] = useState("");
  const minStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
   const [startDate, setStartDate] = useState(minStart);
    const [paymentPref, setPaymentPref] = useState<"CHECKOUT" | "INVOICE">("CHECKOUT");
   const [contactName, setContactName] = useState("");
   const [contactEmail, setContactEmail] = useState("");
   const [contactPhone, setContactPhone] = useState("");
   const [companySite, setCompanySite] = useState("");
 
   const total = calculatePrice(termMonths);
 
  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!isHomeNet || !homeNetId.trim()) {
       setToast({ type: "error", title: "HomeNet Required", message: "We currently onboard via HomeNet only. Please contact our manager via the form." });
       window.location.assign("/dealers#dealerForm");
       return;
     }
    if (paymentPref === "INVOICE") {
      setToast({ type: "success", title: "Invoice request", message: "Please complete the manager form and we will send an invoice." });
      window.location.assign("/dealers#dealerForm");
      return;
    }
    if (homeNetId.trim() === "00000" && paymentPref === "CHECKOUT") {
      try {
        const res = await fetch("/api/dealers/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeNetDealerId: homeNetId.trim(), termMonths, startDate }),
        });
        if (!res.ok) {
          setToast({ type: "error", title: "Stripe error", message: "Unable to create session." });
          return;
        }
        const data = await res.json();
        if (data?.url) {
          window.open(data.url, "_blank", "noopener");
          return;
        }
        setToast({ type: "error", title: "Stripe error", message: "Missing session URL." });
      } catch {
        setToast({ type: "error", title: "Stripe error", message: "Network error while creating session." });
      }
      return;
    }
    setToast({ type: "success", title: "Saved", message: "Details captured. Proceeding to payment will be enabled later." });
   };
 
   return (
     <div className={styles.container}>
       {toast && (
         <div className={styles.toastContainer}>
           <Toast
             message={toast.message}
             type={toast.type}
             title={toast.title}
             onClose={() => setToast(null)}
           />
         </div>
       )}
       <div className={styles.contentWrapper}>
         <div className={styles.infoSection}>
           <div className={styles.orderCard}>
             <h1 className={styles.orderTitle}>Add Your Inventory to CarCupid</h1>
             <p className={styles.orderText}>Monthly placement is $150 per month. We currently integrate via HomeNet.</p>
             <div className={styles.orderSummary}>
               <div className={styles.orderSummaryLabel}>Total</div>
               <div className={styles.orderTotal}>${total.toFixed(2)}</div>
             </div>
             <form onSubmit={handleSubmit} className={styles.orderForm}>
               <div className={styles.orderGrid}>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderLabel}>Term</div>
                   <div className={styles.pillRow}>
                     <button type="button" className={termMonths===1?styles.pillActive:styles.pill} onClick={()=>setTermMonths(1)}>1 mo</button>
                     <button type="button" className={termMonths===3?styles.pillActive:styles.pill} onClick={()=>setTermMonths(3)}>3 mo</button>
                     <button type="button" className={termMonths===6?styles.pillActive:styles.pill} onClick={()=>setTermMonths(6)}>6 mo</button>
                     <button type="button" className={termMonths===12?styles.pillActive:styles.pill} onClick={()=>setTermMonths(12)}>12 mo</button>
                   </div>
                 </div>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderLabel}>Start Date (optional)</div>
                   <input className={styles.input} type="date" min={minStart} value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                   <div className={styles.orderHint}>We may take up to 48 hours to activate your inventory (verification and setup), but we aim to be faster.</div>
                 </div>
                <div className={styles.orderGroup}>
                  <div className={styles.orderLabel}>Payment</div>
                  <div className={styles.radioRow}>
                    <label className={styles.radioItem}>
                      <input type="radio" name="paymentPref" checked={paymentPref==="CHECKOUT"} onChange={()=>setPaymentPref("CHECKOUT")} />
                      Card or ACH (via Stripe)
                    </label>
                    <label className={styles.radioItem}>
                      <input type="radio" name="paymentPref" checked={paymentPref==="INVOICE"} onChange={()=>setPaymentPref("INVOICE")} />
                      Request Invoice
                    </label>
                  </div>
                  {paymentPref==="INVOICE" && (
                    <div className={styles.orderHint}>We will invoice your dealership by email. Our manager will confirm details via the form.</div>
                  )}
                </div>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderNotice}>
                     Don&apos;t have HomeNet? <Link href="/dealers#dealerForm" className={styles.orderLink}>Contact our manager via the form</Link>.
                   </div>
                 </div>
                 <div className={styles.orderGroup}>
                   <label className={styles.checkWrap}>
                     <input
                       type="checkbox"
                       checked={isHomeNet}
                       onChange={(e)=>setIsHomeNet(e.target.checked)}
                       required
                       className={styles.checkbox}
                     />
                     <span className={styles.checkboxUi} aria-hidden="true" />
                     <span className={styles.checkLabel}>Our dealership is on HomeNet</span>
                   </label>
                 </div>
                 <div className={styles.orderGroup}>
                   <div className={`${styles.collapseSlot} ${isHomeNet ? styles.open : ""}`}>
                     <input
                       className={styles.input}
                       type="text"
                       placeholder="Enter your HomeNet Dealer ID"
                       value={homeNetId}
                       onChange={(e)=>setHomeNetId(e.target.value)}
                       required={isHomeNet}
                     />
                   </div>
                 </div>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderLabel}>Contact</div>
                   <div className={styles.orderCols}>
                     <input className={styles.input} type="text" placeholder="Contact name" value={contactName} onChange={(e)=>setContactName(e.target.value)} />
                     <input className={styles.input} type="email" placeholder="Email" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
                     <input className={styles.input} type="tel" placeholder="Phone (optional)" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} />
                   </div>
                 </div>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderLabel}>Website (optional)</div>
                   <input className={styles.input} type="url" placeholder="https://dealership.com" value={companySite} onChange={(e)=>setCompanySite(e.target.value)} />
                 </div>
               </div>
              <div className={styles.orderActions}>
                <button
                  type="submit"
                  className={`${styles.orderButton} ${(isHomeNet && homeNetId.trim()) ? styles.orderButtonActive : ""}`}
                  disabled={!(isHomeNet && homeNetId.trim())}
                >
                  Continue
                </button>
                 <Link className={styles.orderSecondary} href="/dealers#dealerForm">Talk to a Manager</Link>
                 <span className={styles.orderNote}>Total: ${total.toFixed(2)}</span>
               </div>
             </form>
           </div>
         </div>
       </div>
     </div>
   );
 }
