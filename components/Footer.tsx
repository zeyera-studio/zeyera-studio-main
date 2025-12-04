import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-neon-green transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">News</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-neon-green transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Device Support</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-neon-green transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Cookie Preferences</a></li>
              <li><a href="#" className="hover:text-neon-green transition-colors">Corporate Information</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-neon-green hover:text-black transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-neon-green hover:text-black transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-neon-green hover:text-black transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-neon-green hover:text-black transition-all">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © 2024 Zeyera Studio, Inc. All rights reserved.
          </p>
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-500 text-xs font-mono">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;