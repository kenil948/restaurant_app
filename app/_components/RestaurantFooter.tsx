const RestaurantFooter = () => {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <p className="text-center text-sm text-zinc-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-orange-500">
            Restaurant Portal
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default RestaurantFooter;