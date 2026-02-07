import { MapPin } from 'lucide-react';

interface City {
  name: string;
  country: string;
  imageUrl: string;
  eventCount: number;
}

interface CityExplorerProps {
  cities: City[];
  onCitySelect: (cityName: string) => void;
}

export default function CityExplorer({ cities, onCitySelect }: CityExplorerProps) {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-2">Explore by Location</h2>
        <p className="text-gray-400 text-sm">Discover events in major cities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cities.map((city) => (
          <div
            key={city.name}
            onClick={() => onCitySelect(city.name)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group h-48 border border-[#222] hover:border-streetiz-red/50 transition-all"
          >
            <img
              src={city.imageUrl}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-streetiz-red flex-shrink-0" />
                <span className="text-xs font-bold text-gray-300 uppercase">{city.country}</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-1 group-hover:text-streetiz-red transition-colors">
                {city.name}
              </h3>
              <p className="text-sm text-gray-300">
                <span className="font-bold text-white">{city.eventCount}</span> events
              </p>
            </div>

            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold text-white">Explore</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
