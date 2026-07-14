import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";

export default function FinalCta() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 px-8 py-16 text-center shadow-lift sm:px-16 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -left-20 -top-20 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-gold-400/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Build Better Financial Habits?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-navy-200">
              Join thousands of students turning small daily wins into lifelong
              money confidence.
            </p>
            <Link
              to="/start"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-semibold text-navy-900 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Get Started
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
