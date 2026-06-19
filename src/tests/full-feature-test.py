import json, sys

PASS = []; FAIL = []
def check(name, cond, detail=''):
    if cond: PASS.append(name); print(f'  [PASS] {name}')
    else: FAIL.append(name); print(f'  [FAIL] {name}{(" - " + detail) if detail else ""}')

print('\n====== EcoTrace Full Feature Test Suite ======\n')

# ---- Emission Factor Constants ----
print('--- Emission Factors ---')
EF_CAR = {'PETROL':0.18,'DIESEL':0.17,'HYBRID':0.10,'ELECTRIC':0.05}
EF_PUBLIC = 0.035
EF_FLIGHT_SHORT = 150; EF_FLIGHT_LONG = 500
EF_GRID = 0.40
EF_DIET = {'VEGAN':125,'VEGETARIAN':140,'LOW_MEAT':210,'AVERAGE':210,'HIGH_MEAT':275}
EF_SHOP = {'MINIMALIST':50,'AVERAGE':120,'HEAVY':250}
EF_WASTE = {'LOW':10,'AVERAGE':30,'HIGH':60}

check('PETROL factor = 0.18', EF_CAR['PETROL'] == 0.18)
check('ELECTRIC factor = 0.05', EF_CAR['ELECTRIC'] == 0.05)
check('VEGAN diet = 125 kg', EF_DIET['VEGAN'] == 125)
check('HIGH_MEAT diet = 275 kg', EF_DIET['HIGH_MEAT'] == 275)
check('Grid electricity = 0.40 kg/kWh', EF_GRID == 0.40)

# ---- Calculator Functions ----
print('\n--- Calculator Functions ---')

def calc_transport(car_dist, fuel, pub_dist, fs, fl):
    return round(car_dist*EF_CAR[fuel] + pub_dist*EF_PUBLIC + (fs*EF_FLIGHT_SHORT)/12 + (fl*EF_FLIGHT_LONG)/12, 2)

def calc_energy(kwh, renewable_pct):
    return round(kwh * EF_GRID * (1 - min(100, renewable_pct)/100), 2)

def calc_lifestyle(diet, shopping, waste):
    return round(EF_DIET[diet] + EF_SHOP[shopping] + EF_WASTE[waste], 2)

# Transport tests
check('Petrol 100km = 18 kg', calc_transport(100,'PETROL',0,0,0) == 18.0)
check('Electric 100km = 5 kg', calc_transport(100,'ELECTRIC',0,0,0) == 5.0)
check('Hybrid 100km = 10 kg', calc_transport(100,'HYBRID',0,0,0) == 10.0)
check('Diesel 100km = 17 kg', calc_transport(100,'DIESEL',0,0,0) == 17.0)
check('Public 100km = 3.5 kg', calc_transport(0,'PETROL',100,0,0) == 3.5)
check('12 short flights = 150 kg/mo', calc_transport(0,'PETROL',0,12,0) == 150.0)
check('12 long flights = 500 kg/mo', calc_transport(0,'PETROL',0,0,12) == 500.0)
check('Zero all transport = 0', calc_transport(0,'PETROL',0,0,0) == 0.0)
check('Combined transport correct', calc_transport(100,'PETROL',200,12,3) == 300.0)

# Energy tests
check('350kWh 0% renewable = 140 kg', calc_energy(350, 0) == 140.0)
check('500kWh 50% renewable = 100 kg', calc_energy(500, 50) == 100.0)
check('1000kWh 100% renewable = 0 kg', calc_energy(1000, 100) == 0.0)
check('0kWh = 0 kg', calc_energy(0, 0) == 0.0)
check('Renewable clamp at 100%', calc_energy(500, 150) == 0.0)

# Lifestyle tests
check('VEGAN+MINIMALIST+LOW = 185', calc_lifestyle('VEGAN','MINIMALIST','LOW') == 185.0)
check('HIGH_MEAT+HEAVY+HIGH = 585', calc_lifestyle('HIGH_MEAT','HEAVY','HIGH') == 585.0)
check('AVERAGE+AVERAGE+AVERAGE = 360', calc_lifestyle('AVERAGE','AVERAGE','AVERAGE') == 360.0)
check('LOW_MEAT+AVERAGE+AVERAGE = 360', calc_lifestyle('LOW_MEAT','AVERAGE','AVERAGE') == 360.0)

# ---- Validation Rules ----
print('\n--- Input Validation ---')

def validate_transport(car_dist='', fuel='PETROL', pub='', fs='', fl=''):
    errors = {}
    if car_dist != '':
        v = float(car_dist) if car_dist else 0
        if v < 0: errors['carDist'] = 'Must be non-negative'
        if v > 10000: errors['carDist'] = 'Exceeds max 10000 km'
    if pub != '':
        v = float(pub) if pub else 0
        if v < 0: errors['pubDist'] = 'Must be non-negative'
    if fs != '':
        try:
            v = float(fs)
            if v < 0 or v != int(v): errors['flightsShort'] = 'Must be non-negative integer'
        except: errors['flightsShort'] = 'Invalid number'
    if fl != '':
        try:
            v = float(fl)
            if v < 0 or v != int(v): errors['flightsLong'] = 'Must be non-negative integer'
        except: errors['flightsLong'] = 'Invalid number'
    return errors

def validate_energy(kwh='', renewable=''):
    errors = {}
    if kwh != '':
        try:
            v = float(kwh)
            if v < 0: errors['kwh'] = 'Must be non-negative'
            if v > 5000: errors['kwh'] = 'Exceeds 5000 kWh limit'
        except: errors['kwh'] = 'Invalid number'
    if renewable != '':
        try:
            v = float(renewable)
            if v < 0 or v > 100: errors['renewable'] = 'Must be 0-100'
        except: errors['renewable'] = 'Invalid number'
    return errors

check('Negative car distance rejected', bool(validate_transport(car_dist='-50')))
check('Non-integer flights rejected', bool(validate_transport(fs='2.5')))
check('Negative flights rejected', bool(validate_transport(fl='-1')))
check('Valid transport passes', not validate_transport(car_dist='500', pub='200', fs='2', fl='1'))
check('Renewable > 100% rejected', bool(validate_energy(renewable='150')))
check('Negative kWh rejected', bool(validate_energy(kwh='-10')))
check('kWh over 5000 rejected', bool(validate_energy(kwh='9999')))
check('Valid energy passes', not validate_energy(kwh='350', renewable='50'))

# ---- State Management ----
print('\n--- State Management ---')

ACHIEVEMENTS_DEF = [
    {'id':'first_calc','icon':'🌱','title':'First Footprint','desc':'Completed your first calculation.'},
    {'id':'eco_warrior','icon':'🛡️','title':'Eco Warrior','desc':'Emissions below 600 kg/month.'},
    {'id':'reducer','icon':'📉','title':'Carbon Cutter','desc':'Reduced footprint vs previous.'},
    {'id':'commuter','icon':'🚲','title':'Clean Commuter','desc':'Zero car, active transit.'},
    {'id':'solar','icon':'☀️','title':'Sun Powered','desc':'100% renewable electricity.'},
    {'id':'goal_done','icon':'🏆','title':'Goal Getter','desc':'Completed a goal.'},
]

def make_state():
    return {
        'footprints': [],
        'goals': [
            {'id':'g1','desc':'Reduce car travel by 20%','type':'reduction','target':20,'current':0,'done':False},
            {'id':'g2','desc':'Public transport 12 times','type':'habit','target':12,'current':0,'done':False}
        ],
        'achievements': [dict(a, unlocked=False, unlockedAt=None) for a in ACHIEVEMENTS_DEF],
        'theme': 'dark'
    }

state = make_state()
check('State initializes with 0 footprints', len(state['footprints']) == 0)
check('State initializes with 2 default goals', len(state['goals']) == 2)
check('State initializes with 6 achievements', len(state['achievements']) == 6)
check('Default theme is dark', state['theme'] == 'dark')

# Add footprint
fp1 = {'id':'fp1','date':'2026-06-01T00:00:00Z','transport':300,'energy':140,'lifestyle':360,'total':800,
        'transport_data':{'carDist':500,'fuelType':'PETROL','pubDist':0,'flightsShort':0,'flightsLong':0},
        'energy_data':{'kwh':350,'renewable':0},'lifestyle_data':{'diet':'AVERAGE','shopping':'AVERAGE','waste':'AVERAGE'}}
state['footprints'].append(fp1)
check('Footprint added to state', len(state['footprints']) == 1)
check('Footprint total stored correctly', state['footprints'][0]['total'] == 800)

# Achievement: first_calc
def check_achievements(state):
    fps = state['footprints']
    if not fps: return
    latest = fps[-1]
    def unlock(id_):
        a = next((x for x in state['achievements'] if x['id']==id_), None)
        if a and not a['unlocked']: a['unlocked'] = True
    unlock('first_calc')
    if latest['total'] < 600: unlock('eco_warrior')
    if len(fps) > 1 and latest['total'] < fps[-2]['total']: unlock('reducer')
    if latest['transport_data']['carDist'] == 0 and latest['transport_data']['pubDist'] > 0: unlock('commuter')
    if latest['energy_data']['renewable'] == 100 and latest['energy_data']['kwh'] > 0: unlock('solar')

check_achievements(state)
check('First Footprint achievement unlocked', next(a for a in state['achievements'] if a['id']=='first_calc')['unlocked'])
check('Eco Warrior NOT unlocked (800 kg > 600)', not next(a for a in state['achievements'] if a['id']=='eco_warrior')['unlocked'])

# Add low-emission footprint -> eco warrior
fp_low = {'id':'fp2','date':'2026-06-15T00:00:00Z','transport':100,'energy':50,'lifestyle':200,'total':350,
          'transport_data':{'carDist':0,'fuelType':'PETROL','pubDist':200,'flightsShort':0,'flightsLong':0},
          'energy_data':{'kwh':125,'renewable':0},'lifestyle_data':{'diet':'VEGAN','shopping':'MINIMALIST','waste':'LOW'}}
state['footprints'].append(fp_low)
check_achievements(state)
check('Eco Warrior unlocked (350 kg < 600)', next(a for a in state['achievements'] if a['id']=='eco_warrior')['unlocked'])
check('Carbon Cutter unlocked (350 < 800)', next(a for a in state['achievements'] if a['id']=='reducer')['unlocked'])
check('Clean Commuter unlocked (carDist=0, pubDist>0)', next(a for a in state['achievements'] if a['id']=='commuter')['unlocked'])

# Solar achievement
fp_solar = {'id':'fp3','date':'2026-07-01T00:00:00Z','transport':50,'energy':0,'lifestyle':200,'total':250,
            'transport_data':{'carDist':50,'fuelType':'ELECTRIC','pubDist':0,'flightsShort':0,'flightsLong':0},
            'energy_data':{'kwh':500,'renewable':100},'lifestyle_data':{'diet':'VEGAN','shopping':'MINIMALIST','waste':'LOW'}}
state['footprints'].append(fp_solar)
check_achievements(state)
check('Sun Powered achievement unlocked (100% renewable)', next(a for a in state['achievements'] if a['id']=='solar')['unlocked'])

# ---- Goals ----
print('\n--- Goals System ---')

state2 = make_state()
check('Default 2 goals created', len(state2['goals']) == 2)

new_goal = {'id':'g_new','desc':'Cycle to work 3x/week','type':'habit','target':12,'current':0,'done':False}
state2['goals'].append(new_goal)
check('Custom goal added', len(state2['goals']) == 3)

# Log habit
goal = next(g for g in state2['goals'] if g['id']=='g_new')
goal['current'] = min(goal['target'], goal['current'] + 1)
check('Habit log increments current', goal['current'] == 1)

# Complete a goal
goal['current'] = goal['target']
goal['done'] = goal['current'] >= goal['target']
check('Goal marked done when target reached', goal['done'])

# Delete a goal
state2['goals'] = [g for g in state2['goals'] if g['id'] != 'g_new']
check('Goal deleted from state', len(state2['goals']) == 2)

# Reduction goal progress
state3 = make_state()
baseline = 1000
latest_total = 850
reduction_pct = round(((baseline - latest_total) / baseline) * 100, 1)
check('Reduction goal: 15% calculated correctly', reduction_pct == 15.0)
check('Reduction goal completed at >= target', reduction_pct >= 10)

# ---- Recommendation Engine ----
print('\n--- Recommendation Engine ---')

RECS = [
    {'id':'r1','cat':'TRANSPORTATION','name':'Switch to Public Transit','impact':85},
    {'id':'r2','cat':'TRANSPORTATION','name':'Avoid Short-Haul Flights','impact':150},
    {'id':'r3','cat':'TRANSPORTATION','name':'Switch to Electric Vehicle','impact':220},
    {'id':'r4','cat':'ENERGY','name':'Switch to Renewable Tariff','impact':180},
    {'id':'r5','cat':'ENERGY','name':'Switch to LED Lighting','impact':25},
    {'id':'r6','cat':'LIFESTYLE','name':'Shift to Plant-Based Diet','impact':135},
]

def get_recs(footprints):
    if not footprints: return sorted(RECS, key=lambda r: -r['impact'])
    latest = footprints[-1]
    total = latest['total'] or 1
    weights = {'TRANSPORTATION': latest['transport']/total, 'ENERGY': latest['energy']/total, 'LIFESTYLE': latest['lifestyle']/total}
    scored = [{**r, 'score': r['impact'] * (1 + weights.get(r['cat'], 0) * 2)} for r in RECS]
    return sorted(scored, key=lambda r: -r['score'])

# No footprints: sorted by impact
recs_empty = get_recs([])
check('No footprints: highest impact rec is EV (220)', recs_empty[0]['id'] == 'r3')

# With high transport footprint
fp_high_transport = {'transport': 800, 'energy': 100, 'lifestyle': 100, 'total': 1000}
recs_transport = get_recs([fp_high_transport])
transport_recs = [r for r in recs_transport if r['cat'] == 'TRANSPORTATION']
check('High transport: top 3 include transport recs', recs_transport[0]['cat'] == 'TRANSPORTATION')

# With high energy footprint
fp_high_energy = {'transport': 100, 'energy': 800, 'lifestyle': 100, 'total': 1000}
recs_energy = get_recs([fp_high_energy])
check('High energy: top rec is energy category', recs_energy[0]['cat'] == 'ENERGY')

# ---- Theme toggle ----
print('\n--- Theme Toggle ---')
state4 = make_state()
check('Initial theme is dark', state4['theme'] == 'dark')
state4['theme'] = 'light' if state4['theme'] == 'dark' else 'dark'
check('Theme toggles to light', state4['theme'] == 'light')
state4['theme'] = 'light' if state4['theme'] == 'dark' else 'dark'
check('Theme toggles back to dark', state4['theme'] == 'dark')

# ---- localStorage serialization ----
print('\n--- Data Persistence ---')
state5 = make_state()
state5['footprints'].append(fp1)
serialized = json.dumps(state5)
recovered = json.loads(serialized)
check('State serializes to JSON cleanly', isinstance(serialized, str) and len(serialized) > 0)
check('State deserializes correctly', recovered['footprints'][0]['total'] == 800)
check('All goals survive serialization', len(recovered['goals']) == 2)
check('Achievements survive serialization', len(recovered['achievements']) == 6)

# ---- Corrupted state recovery ----
print('\n--- Corrupted State Recovery ---')
def load_safe(raw):
    try:
        s = json.loads(raw)
        if not s.get('footprints') or not s.get('goals') or not s.get('achievements'):
            raise Exception('Invalid structure')
        return s
    except:
        return make_state()

check('Empty string -> default state', load_safe('') == make_state())
check('Corrupted JSON -> default state', load_safe('{bad json') == make_state())
check('Missing keys -> default state', load_safe('{"footprints":[]}') == make_state())

# ---- Summary ----
print(f'\n====== Results: {len(PASS)} passed, {len(FAIL)} failed ======')
if FAIL:
    print('FAILED TESTS:')
    for f in FAIL: print(f'  - {f}')
    sys.exit(1)
else:
    print('All tests passed!')
    sys.exit(0)
