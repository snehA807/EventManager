import React from "react";
import { Link } from "react-router-dom";

// Import your local images
import img1 from "../assets/1.jpeg";
import img2 from "../assets/2.jpeg";
import img3 from "../assets/3.jpeg";
import img4 from "../assets/4.jpeg";

const clubs = [
  {
    id: 1,
    name: "Music Club",
    organizer: "Rahul Sharma",
    image: img1
  },
  {
    id: 2,
    name: "Dance Club",
    organizer: "Priya Singh",
    image: img2
  },
  {
    id: 3,
    name: "Tech Club",
    organizer: "Ankit Verma",
    image: img3
  },
  {
    id: 4,
    name: "Art Club",
    organizer: "Neha Gupta",
    image: img4
  }
];

const Clubs = () => {
  return (
    <div className="min-h-screen bg-black text-white py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-500">
        Campus Clubs
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-gray-900 rounded-2xl shadow-lg hover:shadow-red-500/40 transition p-5 flex flex-col items-center text-center"
          >
            {/* Round Image */}
            <img
              src={club.image}
              alt={club.name}
              className="w-20 h-20 rounded-full mb-4 border-2 border-red-500"
            />
            {/* Club Name */}
            <h2 className="text-xl font-semibold">{club.name}</h2>
            {/* Organizer Name */}
            <p className="text-gray-400">Organizer: {club.organizer}</p>
            {/* View Details Button */}
            <Link
              to={`/clubs/${club.id}`}
              className="mt-4 bg-red-500 px-4 py-2 rounded hover:bg-red-600 block"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clubs;
