import React from 'react';
import { Paperclip } from 'lucide-react';

const ContactSection: React.FC = () => {
  return (
    <section className="w-full bg-[#050505] py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
          <p className="text-gray-400 text-sm md:text-base">
            Have a question or a submission? We'd love to hear from you.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-white uppercase tracking-wide ml-1">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all duration-300 hover:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-white uppercase tracking-wide ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all duration-300 hover:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-white uppercase tracking-wide ml-1">Contact Number</label>
            <input 
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all duration-300 hover:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-white uppercase tracking-wide ml-1">Message</label>
            <textarea 
              rows={5} 
              placeholder="Your message..." 
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all duration-300 hover:border-white/20 resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 bg-[#111] hover:bg-[#1a1a1a] text-white px-6 py-3 rounded-lg transition-all border border-white/10 w-full sm:w-auto group"
            >
              <Paperclip size={16} className="text-gray-400 group-hover:text-neon-green transition-colors" />
              <span className="text-sm font-medium">Attach Content</span>
            </button>

            <button 
              type="submit" 
              className="w-full sm:w-auto bg-neon-green hover:bg-[#2eb812] text-black font-bold px-10 py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] hover:-translate-y-0.5"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;