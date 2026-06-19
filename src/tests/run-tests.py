import unittest
import sys

# Core coefficients mapping (mimics EmissionFactors.js)
EMISSION_FACTORS = {
    'TRANSPORTATION': {
        'CAR': {
            'PETROL': 0.18,
            'DIESEL': 0.17,
            'HYBRID': 0.10,
            'ELECTRIC': 0.05
        },
        'PUBLIC': 0.035,
        'FLIGHT': {
            'SHORT_HAUL': 150,
            'LONG_HAUL': 500
        }
    },
    'ENERGY': {
        'GRID_ELECTRICITY': 0.40
    },
    'LIFESTYLE': {
        'DIET': {
            'VEGAN': 125,
            'VEGETARIAN': 140,
            'LOW_MEAT': 210,
            'HIGH_MEAT': 275,
            'AVERAGE': 210
        },
        'SHOPPING': {
            'MINIMALIST': 50,
            'AVERAGE': 120,
            'HEAVY': 250
        },
        'WASTE': {
            'LOW': 10,
            'AVERAGE': 30,
            'HIGH': 60
        }
    }
}

class TestCarbonCalculator(unittest.TestCase):
    
    def calculate_transportation(self, car_dist, fuel_type, public_dist, flights_short, flights_long):
        # 1. Car
        fuel_type = fuel_type.upper()
        car_factor = EMISSION_FACTORS['TRANSPORTATION']['CAR'].get(fuel_type, 0.18)
        car_emissions = car_dist * car_factor
        
        # 2. Public
        public_emissions = public_dist * EMISSION_FACTORS['TRANSPORTATION']['PUBLIC']
        
        # 3. Flights (annual to monthly: divide by 12)
        short_flights = (flights_short * EMISSION_FACTORS['TRANSPORTATION']['FLIGHT']['SHORT_HAUL']) / 12
        long_flights = (flights_long * EMISSION_FACTORS['TRANSPORTATION']['FLIGHT']['LONG_HAUL']) / 12
        
        return round(car_emissions + public_emissions + short_flights + long_flights, 2)

    def calculate_energy(self, kwh, renewable_pct):
        renewable_offset = min(100.0, max(0.0, float(renewable_pct))) / 100.0
        emissions = kwh * EMISSION_FACTORS['ENERGY']['GRID_ELECTRICITY'] * (1.0 - renewable_offset)
        return round(emissions, 2)

    def calculate_lifestyle(self, diet, shopping, waste):
        diet = diet.upper()
        shopping = shopping.upper()
        waste = waste.upper()
        
        diet_em = EMISSION_FACTORS['LIFESTYLE']['DIET'].get(diet, 210)
        shop_em = EMISSION_FACTORS['LIFESTYLE']['SHOPPING'].get(shopping, 120)
        waste_em = EMISSION_FACTORS['LIFESTYLE']['WASTE'].get(waste, 30)
        
        return round(diet_em + shop_em + waste_em, 2)

    # --- Test Cases ---
    
    def test_standard_transportation(self):
        # 100km petrol = 18.0
        # 200km public = 7.0
        # 12 short flights = 150.0
        # 3 long flights = 125.0
        # Expected = 18.0 + 7.0 + 150.0 + 125.0 = 300.0
        res = self.calculate_transportation(100, 'PETROL', 200, 12, 3)
        self.assertEqual(res, 300.0)

    def test_ev_transportation(self):
        # 1000km electric car = 50.0
        # 0 public, 0 flights
        # Expected = 50.0
        res = self.calculate_transportation(1000, 'ELECTRIC', 0, 0, 0)
        self.assertEqual(res, 50.0)

    def test_energy_with_renewable_offset(self):
        # 500 kWh electricity * 0.4 = 200 kg CO2e
        # 50% renewable -> 200 * 0.5 = 100 kg CO2e
        res = self.calculate_energy(500, 50)
        self.assertEqual(res, 100.0)

    def test_energy_100_percent_renewable(self):
        # 1000 kWh electricity, 100% renewable
        # Expected = 0.0
        res = self.calculate_energy(1000, 100)
        self.assertEqual(res, 0.0)

    def test_lifestyle_vegan_minimalist(self):
        # Vegan diet = 125
        # Minimalist shopping = 50
        # Low waste = 10
        # Expected = 125 + 50 + 10 = 185
        res = self.calculate_lifestyle('vegan', 'minimalist', 'low')
        self.assertEqual(res, 185.0)

    def test_edge_cases_empty_and_zeros(self):
        # Test zero inputs
        res_trans = self.calculate_transportation(0, 'PETROL', 0, 0, 0)
        self.assertEqual(res_trans, 0.0)
        
        res_energy = self.calculate_energy(0, 0)
        self.assertEqual(res_energy, 0.0)

    def test_edge_cases_boundary_caps(self):
        # High calculations bounds check
        res = self.calculate_energy(5000, 100)
        self.assertEqual(res, 0.0)

if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCarbonCalculator)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if not result.wasSuccessful():
        sys.exit(1)
    else:
        sys.exit(0)
