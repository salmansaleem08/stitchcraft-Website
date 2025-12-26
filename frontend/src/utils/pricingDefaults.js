// Default pricing based on service type and garment type
export const getDefaultPricing = (serviceType, garmentType) => {
  const basePrices = {
    basic: {
      "Shalwar Kameez": 2000,
      "Sherwani": 5000,
      "Lehenga": 8000,
      "Suit": 4000,
      "Dress": 3000,
      "Pants/Trousers": 1500,
      "Kurta": 1500,
      "Other": 2500,
    },
    premium: {
      "Shalwar Kameez": 4000,
      "Sherwani": 10000,
      "Lehenga": 15000,
      "Suit": 8000,
      "Dress": 6000,
      "Pants/Trousers": 3000,
      "Kurta": 3000,
      "Other": 5000,
    },
    luxury: {
      "Shalwar Kameez": 8000,
      "Sherwani": 20000,
      "Lehenga": 30000,
      "Suit": 15000,
      "Dress": 12000,
      "Pants/Trousers": 6000,
      "Kurta": 6000,
      "Other": 10000,
    },
    bulk: {
      "Shalwar Kameez": 1500,
      "Sherwani": 4000,
      "Lehenga": 6000,
      "Suit": 3000,
      "Dress": 2500,
      "Pants/Trousers": 1200,
      "Kurta": 1200,
      "Other": 2000,
    },
  };

  return basePrices[serviceType]?.[garmentType] || 3000;
};

