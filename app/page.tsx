"use client"

import React, { useEffect, useRef, useState } from 'react'
import CustomerHeader from './_components/CustomerHeader'
import RestaurantFooter from './_components/RestaurantFooter'
import { useRouter } from 'next/navigation'

const Home = () => {

  type RestaurantType = {
    _id: string;
    restaurantName: string;
    city: string;
    fullAddress: string;
    contactNumber: string;
    email: string;
  };

  type SearchParams = {
    location?: string;
    restaurant?: string;
  };

  const [locations, setLocations] = useState<string[]>([]);
  const [showLocations, setShowLocations] = useState(false)
  const [selectedValue, setSelectedValue] = useState("");
  const [restaurantList, setRestaurantList] = useState<RestaurantType[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLocation = async () => {
    const response = await fetch("/api/customer/locations");
    const data = await response.json();

    if (response.ok) {
      setLocations(data.data);
    }
  };

  const restaurantLists = async (params: SearchParams) => {

    let url = "/api/customer";

    if (params?.location) {
      url = url + `?location=${params.location}`
    } else if (params?.restaurant) {
      url = url + `?restaurant=${params.restaurant}`
    }
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      setRestaurantList(data.data);

    }
  }

  const handleShowLocation = () => {
    setShowLocations(true)

  }

  const handleSelectedValue = (location: string) => {
    setShowLocations(false)
    setSelectedValue(location)
    restaurantLists({ location: location })
  }

  useEffect(() => {

    const fetchData = async (params?: SearchParams) => {
      await handleLocation();
      await restaurantLists(params || {});
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocations(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div>
        <CustomerHeader />
      </div>
      <section
        className="relative min-h-screen flex flex-col items-center justify-start"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/65"></div>

        <div className="relative z-10 text-center mt-25">
          <h1 className="text-6xl font-bold text-white">
            Discover Delicious Food
          </h1>

          <p className="text-xl text-white/90 mt-4">
            Order from the best restaurants in your city
          </p>

          <div className="bg-white rounded-2xl p-2 flex items-center shadow-xl w-[900px] mx-auto mt-10">

            <div ref={dropdownRef} className="w-60 relative border-r border-zinc-200">
              <input
                onClick={handleShowLocation}
                value={selectedValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedValue(value);

                  if (!value.trim()) {
                    restaurantLists({});
                  }
                }}
                type="text"
                placeholder="📍 Select location"
                className="w-full px-5 py-4 outline-none text-zinc-700 placeholder:text-zinc-400 rounded-l-2xl"
              />
              {showLocations && (
                <ul className="absolute left-0 top-[68px] w-full bg-white rounded-xl shadow-xl border border-zinc-200 overflow-y-auto max-h-50 z-50">
                  {locations.map((location) => (
                    <li
                      key={location}
                      onClick={() => handleSelectedValue(location)}
                      className="px-5 py-3 text-left cursor-pointer text-zinc-700 hover:bg-orange-50 hover:text-orange-500 transition border-b border-zinc-100 last:border-b-0"
                    >
                      📍 {location}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex-1">
              <input
                onChange={(e) => restaurantLists({ restaurant: e.target.value })}
                type="text"
                placeholder="Search for restaurants, food..."
                className="w-full px-5 py-4 outline-none"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-b from-zinc-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="inline-block px-5 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              Restaurants Near You
            </span>

            <h2 className="text-5xl font-bold text-zinc-900 mt-5">
              Popular Restaurants
            </h2>

            <p className="text-zinc-500 text-lg mt-4 max-w-2xl mx-auto leading-8">
              Explore the best restaurants across Gujarat and discover
              delicious meals from your favorite places.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {restaurantList.length > 0 ? (
              restaurantList.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-zinc-200 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[380px]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 leading-tight">
                        {item.restaurantName}
                      </h2>

                      <p className="text-orange-500 font-medium mt-2">
                        📍 {item.city}
                      </p>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🍽️
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="text-zinc-500 leading-8 line-clamp-3">
                      {item.fullAddress}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-3 text-zinc-700 font-medium">
                      <span className="text-lg">📞</span>
                      <span>{item.contactNumber}</span>
                    </div>

                    <button onClick={() => router.push(`/explore/${item.restaurantName}?id=${item._id}`)} className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-medium transition cursor-pointer">
                      View Menu
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-20">
                <div className="text-7xl mb-4">🍽️</div>

                <h3 className="text-3xl font-bold text-zinc-800">
                  No Restaurants Found
                </h3>

                <p className="text-zinc-500 mt-3 text-lg">
                  Try searching with another restaurant name or location.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>
      <div>
        <RestaurantFooter />
      </div>
    </div>
  )
}

export default Home;