 "use client";

 import { useState } from "react";
 import Link from "next/link";
 import styles from "../dealers.module.css";
 import Toast, { ToastType } from "@/components/Toast";
import DatePicker from "@/components/DatePicker";
 
 type Term = 1 | 3 | 6 | 12;
type PaymentPref = "CHECKOUT" | "SUBSCRIPTION";
 
 function calculatePrice(term: Term) {
   return 150 * term;
 }
 
 export default function DealerOrderPage() {
   const [toast, setToast] = useState<{ message: string; type: ToastType; title?: string } | null>(null);
   const [termMonths, setTermMonths] = useState<Term>(1);
  const minStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
   const [startDate, setStartDate] = useState(minStart);
   const [paymentPref, setPaymentPref] = useState<PaymentPref>("SUBSCRIPTION");
   const [contactName, setContactName] = useState("");
   const [contactEmail, setContactEmail] = useState("");
   const [contactPhone, setContactPhone] = useState("");
   const [companySite, setCompanySite] = useState("");
 
   const total = calculatePrice(termMonths);
 
  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
   if (!contactPhone.trim()) {
     setToast({ type: "error", title: "Missing phone", message: "Please enter your phone number." });
     return;
   }
   if (paymentPref === "SUBSCRIPTION") {
     setToast({ type: "success", title: "Subscription", message: "Monthly subscription UI is active. Billing integration is coming soon." });
     return;
   }
    if (paymentPref === "CHECKOUT") {
      try {
        const res = await fetch("/api/dealers/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            homeNetDealerId: "00000",
            termMonths,
            startDate,
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
            website: companySite,
          }),
        });
        if (!res.ok) {
          setToast({ type: "error", title: "Stripe error", message: "Unable to create session." });
          return;
        }
        const data = await res.json();
        if (data?.url) {
          window.location.assign(data.url);
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
            <p className={styles.orderText}>Monthly subscription is $150/mo. Cancel anytime. HomeNet integration supported.</p>
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
                  <DatePicker value={startDate} min={minStart} onChange={setStartDate} className={styles.datePickerWrap} />
                   <div className={styles.orderHint}>We may take up to 48 hours to activate your inventory (verification and setup), but we aim to be faster.</div>
                 </div>
                <div className={styles.orderGroup}>
                 <div className={styles.orderLabel}>Payment</div>
                  <div className={styles.radioRow}>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="paymentPref"
                        value="SUBSCRIPTION"
                        checked={paymentPref==="SUBSCRIPTION"}
                        onChange={(e)=>setPaymentPref(e.target.value as PaymentPref)}
                      />
                      Monthly Subscription ($150/mo)
                    </label>
                    <label className={styles.radioItem}>
                      <input
                        type="radio"
                        name="paymentPref"
                        value="CHECKOUT"
                        checked={paymentPref==="CHECKOUT"}
                        onChange={(e)=>setPaymentPref(e.target.value as PaymentPref)}
                      />
                      Pay Once (Card/ACH)
                    </label>
                  </div>
                  <div className={`${styles.hintSlot} ${paymentPref==="SUBSCRIPTION" ? styles.open : ""}`}>
                    <div className={styles.orderHint}>Monthly subscription UI only for now. Billing integration coming soon.</div>
                  </div>
                </div>
                 <div className={styles.orderGroup}>
                  <div className={styles.orderHint}>Our manager will help you onboard and set up the inventory feed.</div>
                 </div>
                 <div className={styles.orderGroup}>
                   <div className={styles.orderLabel}>Contact</div>
                   <div className={styles.orderCols}>
                    <input className={styles.input} type="text" placeholder="Contact name" value={contactName} onChange={(e)=>setContactName(e.target.value)} spellCheck={false} autoCapitalize="words" />
                     <input className={styles.input} type="email" placeholder="Email" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} />
                    <input className={styles.input} type="tel" placeholder="Phone" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} required />
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
                  className={`${styles.orderButton} ${styles.orderButtonActive}`}
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
