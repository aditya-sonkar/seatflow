import React from "react";

export default function Features() {
  const STEPS = [
    {
      step: "01",
      title: "Find Your Event",
      desc: "Search through verified concerts, club nights, festivals, and comedy shows happening near you."
    },
    {
      step: "02",
      title: "Grab Your Passes",
      desc: "Pick your ticket tier and complete checkout in a few clicks with simple, secure billing."
    },
    {
      step: "03",
      title: "Walk Right In",
      desc: "Access your digital wallet ticket directly from your phone. Present the QR code at the door."
    }
  ];

  const renderIllustration = (step) => {
    let imgUrl = "";
    let altText = "";
    switch (step) {
      case "01":
        imgUrl = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80";
        altText = "Find Your Event";
        break;
      case "02":
        imgUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80";
        altText = "Grab Your Passes";
        break;
      case "03":
        imgUrl = "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=600&q=80";
        altText = "Walk Right In";
        break;
      default:
        return null;
    }

    return (
      <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 relative select-none border border-slate-200/60 dark:border-zinc-800/60 shadow-sm bg-slate-100 dark:bg-zinc-900">
        <img
          src={imgUrl}
          alt={altText}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
      </div>
    );
  };

  return (
    <section className="section-container">
      <div className="section-header">
        <h2 className="section-title">Getting in is <span className="section-title-gradient">Easy</span></h2>
        <p className="section-subtitle">How to discover and book upcoming nightlife, stand-up comedy, and music scenes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((s, idx) => (
          <div key={idx} className="group card p-6 flex flex-col bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl transition-all duration-300">
            {/* Step Illustration */}
            {renderIllustration(s.step)}

            {/* Circular Step Indicator */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-lg font-black mb-5 group-hover:scale-105 transition-all duration-300 shadow-sm">
              {s.step}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors font-sans">
              {s.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
