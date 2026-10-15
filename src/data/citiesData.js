export const CITIES = [
  { id: 'All', name: 'All India 🇮🇳', short: 'ALL', localities: [] },
  { id: 'Bengaluru', name: 'Bengaluru', short: 'BLR', localities: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Bellandur', 'Electronic City', 'BTM Layout', 'Jayanagar'] },
  { id: 'Delhi NCR', name: 'Delhi NCR', short: 'DEL', localities: ['Connaught Place', 'Hauz Khas', 'Saket', 'Noida Sec 62', 'Cyber City Gurgaon', 'Dwarka', 'Rohini', 'Greater Noida'] },
  { id: 'Mumbai', name: 'Mumbai', short: 'BOM', localities: ['Bandra West', 'Andheri East', 'Powai', 'Juhu', 'Worli', 'Thane', 'Malad', 'Navi Mumbai'] },
  { id: 'Pune', name: 'Pune', short: 'PNQ', localities: ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Baner', 'Kothrud', 'Wakad', 'Magarpatta'] },
  { id: 'Hyderabad', name: 'Hyderabad', short: 'HYD', localities: ['Gachibowli', 'Hitec City', 'Madhapur', 'Banjara Hills', 'Jubilee Hills', 'Kondapur', 'Kukatpally'] },
  { id: 'Chennai', name: 'Chennai', short: 'MAA', localities: ['OMR', 'Adyar', 'Velachery', 'T Nagar', 'Anna Nagar', 'Besant Nagar', 'Thiruvanmiyur'] },
  { id: 'Kolkata', name: 'Kolkata', short: 'CCU', localities: ['Salt Lake Sector V', 'New Town', 'Ballygunge', 'Park Street', 'Rajarhat', 'Alipore'] },
  { id: 'Jaipur', name: 'Jaipur', short: 'JAI', localities: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme', 'Mansarovar', 'Tonk Road'] },
  { id: 'Ahmedabad', name: 'Ahmedabad', short: 'AMD', localities: ['SG Highway', 'Bodakdev', 'Satellite', 'Navrangpura', 'Prahlad Nagar', 'Vastrapur'] },
  { id: 'Lucknow', name: 'Lucknow', short: 'LKO', localities: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar'] },
  { id: 'Chandigarh', name: 'Chandigarh', short: 'IXC', localities: ['Sector 17', 'Sector 35', 'IT Park', 'Mohali Phase 7', 'Panchkula'] },
  { id: 'Kochi', name: 'Kochi', short: 'COK', localities: ['Kakkanad', 'Infopark', 'Edapally', 'Panampilly Nagar', 'Fort Kochi'] },
  { id: 'Goa', name: 'Goa', short: 'GOI', localities: ['Panaji', 'Candolim', 'Anjuna', 'Margao', 'Calangute'] }
];

export const CITY_COORDINATES = {
  'Bengaluru': [77.5946, 12.9716],
  'Delhi NCR': [77.2090, 28.6139],
  'Mumbai': [72.8777, 19.0760],
  'Pune': [73.8567, 18.5204],
  'Hyderabad': [78.4867, 17.3850],
  'Chennai': [80.2707, 13.0827],
  'Kolkata': [88.3639, 22.5726],
  'Ahmedabad': [72.5714, 23.0225],
  'Jaipur': [75.7873, 26.9124],
  'Chandigarh': [76.7794, 30.7333],
  'Kochi': [76.2673, 9.9312],
  'Lucknow': [80.9462, 26.8467],
  'Goa': [73.8180, 15.2993]
};

export function detectCityFromCoords(lat, lng) {
  let closestCity = 'Bengaluru';
  let minDistance = Infinity;

  Object.entries(CITY_COORDINATES).forEach(([cityName, [cLng, cLat]]) => {
    const dLat = lat - cLat;
    const dLng = lng - cLng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = cityName;
    }
  });

  return closestCity;
}

