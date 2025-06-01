// components/TJLoader.jsx

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="flex space-x-4 text-[64px] font-bold" style={{ color: '#27c284' }}>
        <span className="animate-bounce">T</span>
        <span className="animate-bounce delay-200">J</span>
      </div>
    </div>
  );
};

export default Loader;
