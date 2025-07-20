'use client';
import React, { useState } from 'react';
import { ChevronLeft, Plus, Search } from 'lucide-react';

export default function PetRegistrationForm() {
  const [selectedType, setSelectedType] = useState('Dog');
  const [selectedGender, setSelectedGender] = useState('Female');
  const [isNeutered, setIsNeutered] = useState(false);
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthday, setBirthday] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-medium text-gray-900">Register Pet</h1>
          <div className="w-6 h-6"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* Pet Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
           
              {/* <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"> */}
                {/* <Plus className="w-4 h-4 text-gray-600" /> */}
              {/* </button> */}
            </div>
          </div>

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedType('Dog')}
                className={`flex-1 py-4 px-6 rounded-xl border-2 font-medium transition-all ${
                  selectedType === 'Dog'
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Dog
              </button>
              <button
                onClick={() => setSelectedType('Cat')}
                className={`flex-1 py-4 px-6 rounded-xl border-2 font-medium transition-all ${
                  selectedType === 'Cat'
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Cat
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Please Enter 8 Characters Or Less"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
            />
          </div>

          {/* Gender Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedGender('Male')}
                className={`flex-1 py-4 px-6 rounded-xl border-2 font-medium transition-all ${
                  selectedGender === 'Male'
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setSelectedGender('Female')}
                className={`flex-1 py-4 px-6 rounded-xl border-2 font-medium transition-all ${
                  selectedGender === 'Female'
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Female
              </button>
            </div>
            
            {/* Neutered Checkbox */}
            <div className="flex items-center mt-4">
              <button
                onClick={() => setIsNeutered(!isNeutered)}
                className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${
                  isNeutered
                    ? 'border-cyan-400 bg-cyan-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isNeutered && (
                  <svg className="w-3 h-3 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className="text-gray-600 font-medium">Neutered Or Not</span>
            </div>
          </div>

          {/* Breed Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Breed <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="No Registered Information"
                className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Birthday Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Birthday <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="YYYY.MM.DD"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      </div>
  
  );
}