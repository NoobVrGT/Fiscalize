import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TransactionModal from "../components/bank/TransactionModal";
import TransactionsTable from "../components/bank/TransactionsTable";
import { useBank } from "../lib/bank";
import { usePageMeta } from "../lib/usePageMeta";

export default function TransactionsPage() {
  usePageMeta("Transactions — Fiscalize");
  const { loading } = useBank();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto min-h-dvh max-w-7xl px-5 pb-24 pt-28 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl dark:text-white">
              Transactions
            </h1>
            <p className="mt-2 text-navy-500 dark:text-navy-200">
              Every dollar in and out of your virtual accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lift"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Transaction
          </button>
        </motion.div>

        {loading ? (
          <div className="grid place-items-center py-24" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-navy-500 dark:text-navy-300">
              <span className="size-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" aria-hidden="true" />
              Loading transactions…
            </div>
          </div>
        ) : (
          <TransactionsTable />
        )}
      </main>
      <Footer />
      <TransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
