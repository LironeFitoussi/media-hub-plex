export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-lg border border-white/30">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <p className="text-gray-700 text-sm">
            © {currentYear} YourApp. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

