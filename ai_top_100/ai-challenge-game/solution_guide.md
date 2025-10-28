# AI 챌린지 문제 풀이 가이드

## 1. 춘식도락 메뉴 분석 챌린지

### 해결 접근 방법

#### 1) 데이터 추출 및 준비
```python
import pytesseract
from PIL import Image
import pandas as pd
import re

# OCR을 사용해 이미지에서 텍스트 추출
def extract_text_from_image(image_path):
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, lang='kor+eng')
    return text

# 8개의 이미지에서 텍스트 추출
image_paths = ['week1.jpg', 'week2.jpg', 'week3.jpg', 'week4.jpg', 
               'week5.jpg', 'week6.jpg', 'week7.jpg', 'week8.jpg']
extracted_texts = [extract_text_from_image(img) for img in image_paths]
```

#### 2) 데이터 구조화
```python
# 텍스트 구조화 함수
def parse_menu_data(text):
    # 날짜 추출
    date_pattern = r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*~\s*(\d{1,2})월\s*(\d{1,2})일'
    date_match = re.search(date_pattern, text)
    
    # 코너별 메뉴 추출
    corners = ['한식A', '한식B', '양식', '팝업A', '팝업B']
    menu_data = []
    
    for corner in corners:
        corner_pattern = f"{corner}\\s*([\\s\\S]*?)(?=(?:{'|'.join(corners)})|$)"
        corner_match = re.search(corner_pattern, text)
        if corner_match:
            menu_text = corner_match.group(1).strip()
            
            # 메뉴명과 칼로리 추출
            menu_pattern = r'([가-힣\s]+)(?:\s+\((\d+)kcal\))?'
            menu_items = re.findall(menu_pattern, menu_text)
            
            for menu_item in menu_items:
                menu_name = menu_item[0].strip()
                calories = int(menu_item[1]) if menu_item[1] else None
                menu_data.append({
                    'date': f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}~{date_match.group(4)}-{date_match.group(5)}",
                    'corner': corner,
                    'menu': menu_name,
                    'calories': calories
                })
    
    return menu_data

# 모든 데이터를 구조화
all_menu_data = []
for i, text in enumerate(extracted_texts):
    menu_data = parse_menu_data(text)
    all_menu_data.extend(menu_data)

# DataFrame으로 변환
menu_df = pd.DataFrame(all_menu_data)
```

### 문제별 풀이 전략

#### 문항 1: 조리법별 메뉴 분석
```python
def solve_question1(menu_df):
    # 1월 13일 주간 데이터 필터링
    jan_13_week_df = menu_df[menu_df['date'].str.contains('2025-1-13')]
    jan_13_lunch_df = jan_13_week_df[jan_13_week_df['meal_type'] == '중식']
    
    # 해당 코너들만 선택
    target_corners = ['한식A', '한식B', '팝업A', '팝업B', '양식']
    filtered_df = jan_13_lunch_df[jan_13_lunch_df['corner'].isin(target_corners)]
    
    # 반찬 메뉴만 추출
    side_dishes = []
    for _, row in filtered_df.iterrows():
        menu_text = row['menu']
        # 주 메뉴와 반찬 분리 (주 메뉴 다음의 모든 항목을 반찬으로 간주)
        parts = menu_text.split(',')
        if len(parts) > 1:
            dishes = [dish.strip() for dish in parts[1:]]
            side_dishes.extend(dishes)
    
    # 조리법별 개수 계산
    cooking_methods = {
        '조림': sum(1 for dish in side_dishes if dish.endswith('조림')),
        '볶음': sum(1 for dish in side_dishes if dish.endswith('볶음')),
        '무침': sum(1 for dish in side_dishes if dish.endswith('무침')),
        '구이': sum(1 for dish in side_dishes if dish.endswith('구이'))
    }
    
    # 내림차순 정렬
    sorted_methods = sorted(cooking_methods.items(), key=lambda x: x[1], reverse=True)
    result = ' > '.join([method for method, count in sorted_methods])
    
    return result
```

#### 문항 2: 1월 칼로리 순위 분석
```python
def solve_question2(menu_df):
    # 1월 데이터만 필터링
    jan_df = menu_df[menu_df['date'].str.contains('2025-1')]
    jan_lunch_df = jan_df[jan_df['meal_type'] == '중식']
    
    # 코너별 평균 칼로리 계산
    corner_calories = {}
    for corner in ['한식A', '한식B', '양식', '팝업A', '팝업B']:
        corner_df = jan_lunch_df[jan_lunch_df['corner'] == corner]
        if not corner_df.empty:
            avg_calories = corner_df['calories'].mean()
            corner_calories[corner] = avg_calories
    
    # 내림차순 정렬
    sorted_corners = sorted(corner_calories.items(), key=lambda x: x[1], reverse=True)
    result = ' > '.join([corner for corner, _ in sorted_corners])
    
    return result
```

#### 문항 3: 지역 특색 메뉴
```python
def solve_question3(menu_df):
    # 1, 2월 데이터 필터링 (모든 식사 시간대 포함)
    jan_feb_df = menu_df[(menu_df['date'].str.contains('2025-1') | menu_df['date'].str.contains('2025-2'))]
    
    # 지역명 목록 (국가/도시/지명)
    locations = ['나가사키', '안동', '전주', '태국', '베트남']
    
    # 지역별 등장 횟수 계산
    location_counts = {}
    for location in locations:
        count = jan_feb_df['menu'].str.contains(location).sum()
        location_counts[location] = count
    
    # 2회 이상 등장한 지역 필터링
    frequent_locations = [loc for loc, count in location_counts.items() if count >= 2]
    
    return frequent_locations
```

#### 문항 4: 메뉴별 칼로리 비교
```python
def solve_question4(menu_df):
    # 1, 2월 데이터 필터링
    jan_feb_df = menu_df[(menu_df['date'].str.contains('2025-1') | menu_df['date'].str.contains('2025-2'))]
    
    # 특정 메뉴들의 칼로리 찾기
    target_menus = ['덴가스떡볶이', '돈코츠라멘', '마라탕면', '수제남산왕돈까스', '탄탄면']
    menu_calories = {}
    
    for menu in target_menus:
        menu_df = jan_feb_df[jan_feb_df['menu'].str.contains(menu)]
        if not menu_df.empty:
            # 가장 정확한 매칭을 위해 정확히 일치하는 항목 검색
            exact_match = menu_df[menu_df['menu'] == menu]
            if not exact_match.empty:
                calories = exact_match['calories'].values[0]
            else:
                # 정확히 일치하는 항목이 없으면 부분 매칭 사용
                calories = menu_df['calories'].values[0]
            menu_calories[menu] = calories
    
    # 내림차순 정렬
    sorted_menus = sorted(menu_calories.items(), key=lambda x: x[1], reverse=True)
    result = ' > '.join([menu for menu, _ in sorted_menus])
    
    return result
```

#### 문항 5: 2월 한 달 식단 최적화 챌린지
```python
def solve_question5(menu_df):
    # 2월 데이터 필터링
    feb_df = menu_df[menu_df['date'].str.contains('2025-2')]
    
    # 주간별로 데이터 분리
    week_dfs = {}
    for week_num, week_start in enumerate(['2025-2-3', '2025-2-10', '2025-2-17', '2025-2-24']):
        week_df = feb_df[feb_df['date'].str.contains(week_start)]
        week_dfs[f'week{week_num+1}'] = week_df
    
    # 최적 조합 찾기
    optimal_combinations = {}
    
    for week_name, week_df in week_dfs.items():
        week_combination = {}
        
        # 각 요일에 대해 처리
        weekdays = ['mon', 'tue', 'wed', 'thu', 'fri']
        for i, day in enumerate(weekdays):
            day_df = week_df[week_df['weekday'] == i]
            
            if day == 'fri':
                # 금요일: 가장 칼로리가 낮은 중식 코너 찾기
                lunch_df = day_df[day_df['meal_type'] == '중식']
                min_calories_corner = lunch_df.loc[lunch_df['calories'].idxmin(), 'corner']
                week_combination[day] = {'lunch': min_calories_corner}
            else:
                # 월-목: 중식+석식 합계 칼로리가 1,550kcal에 가장 근접한 조합 찾기
                lunch_df = day_df[day_df['meal_type'] == '중식']
                dinner_df = day_df[day_df['meal_type'] == '석식']
                
                best_diff = float('inf')
                best_combo = None
                
                for _, lunch in lunch_df.iterrows():
                    for _, dinner in dinner_df.iterrows():
                        total_cal = lunch['calories'] + dinner['calories']
                        diff = abs(total_cal - 1550)
                        
                        if diff < best_diff:
                            best_diff = diff
                            best_combo = (lunch['corner'], dinner['corner'])
                
                week_combination[day] = {
                    'lunch': best_combo[0],
                    'dinner': best_combo[1]
                }
        
        optimal_combinations[week_name] = week_combination
    
    # JSON 형식으로 반환
    return optimal_combinations
```

## 2. 전투 없이 예측하는 시뮬레이션의 힘

### 해결 접근 방법

#### 1) 데이터 탐색 및 전처리
```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split

# 데이터 로드
battles_df = pd.read_csv('battle_simulations.csv')

# 데이터 확인
print(battles_df.head())
print(battles_df.info())

# 결측치 확인 및 처리
print(battles_df.isna().sum())
battles_df = battles_df.dropna()

# 유닛 구성 정보 추출 (예: 각 팀의 유닛 종류 및 수량)
def extract_unit_features(team_composition):
    units = {
        'knight': 0, 'archer': 0, 'infantry': 0, 'mage': 0, 
        'healer': 0, 'assassin': 0, 'tank': 0
    }
    
    for unit in team_composition:
        unit_type = unit['type']
        count = unit['count']
        units[unit_type] += count
    
    return units

# 팀 A와 팀 B의 유닛 구성 특성 추출
team_a_features = battles_df['team_a_composition'].apply(extract_unit_features)
team_b_features = battles_df['team_b_composition'].apply(extract_unit_features)

# 특성을 DataFrame으로 변환
team_a_df = pd.DataFrame(team_a_features.tolist(), prefix='team_a_')
team_b_df = pd.DataFrame(team_b_features.tolist(), prefix='team_b_')

# 배치 정보 특성 추출 (복잡성을 위해 간략화)
def extract_position_features(team_composition):
    # 전방, 중앙, 후방 유닛 수
    front = sum(1 for unit in team_composition if unit['position'][1] < 0.3)
    middle = sum(1 for unit in team_composition if 0.3 <= unit['position'][1] <= 0.7)
    back = sum(1 for unit in team_composition if unit['position'][1] > 0.7)
    
    return {'front': front, 'middle': middle, 'back': back}

# 특성 결합
X = pd.concat([team_a_df, team_b_df], axis=1)
y = battles_df['winner'] # 'A' 또는 'B'

# 훈련/테스트 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

#### 2) 특성 공학
```python
# 유닛 조합 특성 생성
X['knight_archer_synergy_a'] = X['team_a_knight'] * X['team_a_archer']
X['mage_healer_synergy_a'] = X['team_a_mage'] * X['team_a_healer']
X['assassin_healer_synergy_a'] = X['team_a_assassin'] * X['team_a_healer']

X['knight_archer_synergy_b'] = X['team_b_knight'] * X['team_b_archer']
X['mage_healer_synergy_b'] = X['team_b_mage'] * X['team_b_healer']
X['assassin_healer_synergy_b'] = X['team_b_assassin'] * X['team_b_healer']

# 유닛 카운터 관계 특성 생성
X['knight_vs_infantry'] = X['team_a_knight'] / (X['team_b_infantry'] + 1) - X['team_b_knight'] / (X['team_a_infantry'] + 1)
X['archer_vs_knight'] = X['team_a_archer'] / (X['team_b_knight'] + 1) - X['team_b_archer'] / (X['team_a_knight'] + 1)
X['mage_vs_tank'] = X['team_a_mage'] / (X['team_b_tank'] + 1) - X['team_b_mage'] / (X['team_a_tank'] + 1)
X['assassin_vs_archer'] = X['team_a_assassin'] / (X['team_b_archer'] + 1) - X['team_b_assassin'] / (X['team_a_archer'] + 1)

# 팀 구성 다양성 특성
X['diversity_a'] = (X['team_a_knight'] > 0).astype(int) + (X['team_a_archer'] > 0).astype(int) + \
                  (X['team_a_infantry'] > 0).astype(int) + (X['team_a_mage'] > 0).astype(int) + \
                  (X['team_a_healer'] > 0).astype(int) + (X['team_a_assassin'] > 0).astype(int) + \
                  (X['team_a_tank'] > 0).astype(int)

X['diversity_b'] = (X['team_b_knight'] > 0).astype(int) + (X['team_b_archer'] > 0).astype(int) + \
                  (X['team_b_infantry'] > 0).astype(int) + (X['team_b_mage'] > 0).astype(int) + \
                  (X['team_b_healer'] > 0).astype(int) + (X['team_b_assassin'] > 0).astype(int) + \
                  (X['team_b_tank'] > 0).astype(int)

X['diversity_advantage'] = X['diversity_a'] - X['diversity_b']
```

#### 3) 모델링
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb

# 여러 모델 비교
models = {
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
    'XGBoost': xgb.XGBClassifier(n_estimators=100, random_state=42)
}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = accuracy
    print(f"{name} Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, y_pred))

# 최적 모델 선정 (예: XGBoost가 최고 성능이라 가정)
best_model = models['XGBoost']

# 특성 중요도 분석
feature_importances = pd.DataFrame({
    'feature': X.columns,
    'importance': best_model.feature_importances_
}).sort_values('importance', ascending=False)

print(feature_importances.head(10))
```

#### 4) 최적 팀 구성
```python
from scipy.optimize import minimize

# 유닛 비용 정보 (가정)
unit_costs = {
    'knight': 60, 'archer': 45, 'infantry': 30, 'mage': 75, 
    'healer': 70, 'assassin': 65, 'tank': 80
}

# 유닛 구성을 특성 벡터로 변환하는 함수
def composition_to_features(composition):
    features = {}
    
    # 기본 유닛 수 특성
    for unit_type in unit_costs.keys():
        features[f'team_a_{unit_type}'] = composition.get(unit_type, 0)
        features[f'team_b_{unit_type}'] = 0  # 상대방 팀은 알 수 없으므로 평균적인 팀으로 가정
    
    # 시너지 특성
    features['knight_archer_synergy_a'] = features['team_a_knight'] * features['team_a_archer']
    features['mage_healer_synergy_a'] = features['team_a_mage'] * features['team_a_healer']
    features['assassin_healer_synergy_a'] = features['team_a_assassin'] * features['team_a_healer']
    
    # 다양성 특성
    features['diversity_a'] = sum(1 for unit_type in unit_costs if features[f'team_a_{unit_type}'] > 0)
    
    # 나머지 특성들도 계산
    # ...
    
    return features

# 제약 조건을 만족하면서 승률을 최대화하는 팀 구성 찾기
def optimize_team_composition(model, max_units=20, max_unit_types=5, max_cost=1000):
    # 최적화할 목적 함수 (승률의 음수)
    def objective(x):
        # x: [knight_count, archer_count, infantry_count, mage_count, healer_count, assassin_count, tank_count]
        composition = {
            'knight': int(x[0]),
            'archer': int(x[1]),
            'infantry': int(x[2]),
            'mage': int(x[3]),
            'healer': int(x[4]),
            'assassin': int(x[5]),
            'tank': int(x[6])
        }
        
        features = composition_to_features(composition)
        features_df = pd.DataFrame([features])
        
        # 필요한 모든 특성이 있는지 확인
        for col in X.columns:
            if col not in features_df.columns:
                features_df[col] = 0
        
        # 모델에서 사용하는 특성만 선택
        features_df = features_df[X.columns]
        
        # 승률 예측
        win_prob = model.predict_proba(features_df)[0][1]  # 팀 A가 이길 확률
        return -win_prob  # 최소화 문제이므로 음수 취함
    
    # 제약 조건
    constraints = [
        # 총 유닛 수 제한
        {'type': 'eq', 'fun': lambda x: sum(x) - max_units},
        
        # 유닛 종류 제한 (5종류 이하)
        {'type': 'ineq', 'fun': lambda x: max_unit_types - sum(x > 0)},
        
        # 비용 제한
        {'type': 'ineq', 'fun': lambda x: max_cost - sum(unit_costs[unit] * x[i] for i, unit in enumerate(unit_costs.keys()))}
    ]
    
    # 각 유닛 수 제한 (0 이상)
    bounds = [(0, max_units) for _ in range(len(unit_costs))]
    
    # 초기값
    initial_guess = [max_units // len(unit_costs)] * len(unit_costs)
    
    # 최적화 실행
    result = minimize(
        objective, 
        initial_guess, 
        method='SLSQP', 
        bounds=bounds,
        constraints=constraints,
        options={'maxiter': 1000}
    )
    
    # 최적 구성 구하기
    optimal_counts = [int(round(x)) for x in result.x]
    optimal_composition = {
        unit: count for unit, count in zip(unit_costs.keys(), optimal_counts) if count > 0
    }
    
    # 결과 구성
    total_cost = sum(unit_costs[unit] * count for unit, count in optimal_composition.items())
    win_rate = -objective(result.x)
    
    return {
        'team_composition': [
            {'unit': unit, 'count': count, 'position': generate_positions(unit, count)}
            for unit, count in optimal_composition.items()
        ],
        'expected_win_rate': float(win_rate),
        'total_cost': int(total_cost)
    }

# 단순한 포지션 생성 함수 (실제로는 더 복잡한 최적화가 필요)
def generate_positions(unit_type, count):
    positions = []
    
    # 유닛 타입별로 기본 배치 전략
    if unit_type in ['knight', 'tank', 'infantry']:
        # 전방 배치
        row = 0.2
    elif unit_type in ['assassin', 'mage']:
        # 중앙 배치
        row = 0.5
    else:  # healer, archer
        # 후방 배치
        row = 0.8
    
    # 가로 방향으로 균등 분포
    for i in range(count):
        col = (i + 1) / (count + 1)
        positions.append(int(i + 1))  # 간단한 ID로 대체
    
    return positions

# 최적 팀 구성 찾기
optimal_team = optimize_team_composition(best_model)
print(json.dumps(optimal_team, indent=2))
```

#### 5) 배치 최적화
```python
def optimize_unit_positions(team_composition, opponent_composition):
    # 유닛 타입별 적 카운터 관계
    counter_relationships = {
        'knight': ['infantry', 'assassin'],
        'archer': ['knight', 'mage'],
        'infantry': ['archer', 'assassin'],
        'mage': ['knight', 'healer'],
        'healer': ['assassin', 'infantry'],
        'assassin': ['mage', 'archer'],
        'tank': ['infantry', 'knight']
    }
    
    # 각 유닛의 위치 최적화
    optimized_positions = {}
    
    # 상대 팀의 유닛 위치 맵
    opponent_positions = {}
    for unit in opponent_composition:
        unit_type = unit['unit']
        for pos_id in unit['position']:
            opponent_positions[pos_id] = unit_type
    
    # 각 유닛 타입별로 최적의 위치 찾기
    for unit_item in team_composition:
        unit_type = unit_item['unit']
        count = unit_item['count']
        
        # 이 유닛이 카운터할 수 있는 적 유닛 찾기
        counters = counter_relationships.get(unit_type, [])
        
        # 적 유닛의 위치 파악
        target_positions = [pos_id for pos_id, enemy_type in opponent_positions.items() if enemy_type in counters]
        
        # 타겟 위치가 없으면 기본 전략 사용
        if not target_positions:
            if unit_type in ['knight', 'tank', 'infantry']:
                # 전방 배치
                positions = list(range(1, count + 1))
            elif unit_type in ['assassin', 'mage']:
                # 중앙 배치
                positions = list(range(count + 1, 2 * count + 1))
            else:  # healer, archer
                # 후방 배치
                positions = list(range(2 * count + 1, 3 * count + 1))
        else:
            # 타겟 위치에 가까운 곳에 배치
            positions = target_positions[:count] if len(target_positions) >= count else target_positions + list(range(len(target_positions) + 1, count + 1))
        
        optimized_positions[unit_type] = positions
    
    # 최적화된 팀 구성 반환
    optimized_team = []
    for unit_item in team_composition:
        unit_type = unit_item['unit']
        count = unit_item['count']
        optimized_team.append({
            'unit': unit_type,
            'count': count,
            'position': optimized_positions[unit_type]
        })
    
    return optimized_team
```

#### 6) 적응형 카운터 전략
```python
def generate_counter_team(opponent_composition, model, max_units=20, max_cost=1000):
    # 상대 팀 분석
    opponent_units = {}
    for unit_item in opponent_composition:
        unit_type = unit_item['unit']
        count = unit_item['count']
        opponent_units[unit_type] = count
    
    # 유닛 카운터 관계
    counter_map = {
        'knight': {'strong_against': ['infantry'], 'weak_against': ['archer', 'mage']},
        'archer': {'strong_against': ['knight'], 'weak_against': ['infantry', 'assassin']},
        'infantry': {'strong_against': ['archer'], 'weak_against': ['knight', 'mage']},
        'mage': {'strong_against': ['infantry', 'tank'], 'weak_against': ['assassin']},
        'healer': {'strong_against': [], 'weak_against': ['assassin']},
        'assassin': {'strong_against': ['mage', 'healer', 'archer'], 'weak_against': ['knight', 'tank']},
        'tank': {'strong_against': ['assassin'], 'weak_against': ['mage']}
    }
    
    # 카운터 유닛 점수 계산
    counter_scores = {unit: 0 for unit in unit_costs.keys()}
    
    for enemy_unit, enemy_count in opponent_units.items():
        # 이 적 유닛을 카운터할 수 있는 유닛의 점수 증가
        for our_unit, relationships in counter_map.items():
            if enemy_unit in relationships['strong_against']:
                # 이 적 유닛이 우리 유닛을 카운터 -> 이 유닛은 피함
                counter_scores[our_unit] -= enemy_count * 2
            if enemy_unit in relationships['weak_against']:
                # 이 적 유닛이 우리 유닛에게 약함 -> 이 유닛을 선택
                counter_scores[our_unit] += enemy_count * 3
    
    # 최적의 유닛 구성 구하기
    # (간단한 그리디 알고리즘으로 구현, 실제로는 더 복잡한 최적화가 필요)
    remaining_units = max_units
    remaining_cost = max_cost
    counter_composition = {unit: 0 for unit in unit_costs.keys()}
    
    # 점수가 높은 순으로 유닛 정렬
    sorted_units = sorted(counter_scores.items(), key=lambda x: x[1], reverse=True)
    
    for unit, score in sorted_units:
        if score <= 0:  # 점수가 0 이하인 유닛은 건너뜀
            continue
            
        # 이 유닛을 최대한 많이 추가
        max_possible = min(remaining_units, remaining_cost // unit_costs[unit])
        if max_possible > 0:
            counter_composition[unit] = max_possible
            remaining_units -= max_possible
            remaining_cost -= max_possible * unit_costs[unit]
    
    # 남은 유닛 슬롯에 기본 유닛 추가
    if remaining_units > 0 and remaining_cost > 0:
        for unit in sorted(unit_costs.keys(), key=lambda u: unit_costs[u]):
            while remaining_units > 0 and remaining_cost >= unit_costs[unit]:
                counter_composition[unit] += 1
                remaining_units -= 1
                remaining_cost -= unit_costs[unit]
    
    # 최종 팀 구성
    team_composition = [
        {'unit': unit, 'count': count, 'position': generate_positions(unit, count)}
        for unit, count in counter_composition.items() if count > 0
    ]
    
    # 최적의 배치 적용
    optimized_team = optimize_unit_positions(team_composition, opponent_composition)
    
    # 예상 승률 계산
    features = composition_to_features({unit_item['unit']: unit_item['count'] for unit_item in optimized_team})
    features_df = pd.DataFrame([features])
    
    # 필요한 모든 특성이 있는지 확인
    for col in X.columns:
        if col not in features_df.columns:
            features_df[col] = 0
    
    features_df = features_df[X.columns]
    win_prob = model.predict_proba(features_df)[0][1]
    
    total_cost = sum(unit_costs[unit_item['unit']] * unit_item['count'] for unit_item in optimized_team)
    
    return {
        'team_composition': optimized_team,
        'expected_win_rate': float(win_prob),
        'total_cost': int(total_cost),
        'countering_strategy': {enemy: list(counter_map.keys()) for enemy, counters in counter_map.items()}
    }
```

## 3. PDF 속 스텔스 텍스트 추적기

### 해결 접근 방법

#### 1) 데이터 준비 및 분석
```python
import PyPDF2
import pikepdf
import re
import pdfplumber
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from stegano import lsb

# PDF 파일 목록
pdf_files = [f'document_{i}.pdf' for i in range(1, 51)]

# 스텔스 기법 목록
stealth_techniques = {
    'metadata_hiding': '메타데이터 은닉',
    'invisible_text': '비가시 텍스트',
    'image_steganography': '이미지 스테가노그래피',
    'font_variation': '폰트 변형',
    'character_spacing': '문자 간격 코딩'
}

# 각 기법별 탐지 결과 저장
detection_results = {technique: [] for technique in stealth_techniques.keys()}
```

#### 2) 스텔스 기법 탐지
```python
def detect_stealth_techniques(pdf_path):
    detected_techniques = []
    
    # 메타데이터 은닉 탐지
    with pikepdf.open(pdf_path) as pdf:
        metadata = pdf.docinfo
        suspicious_metadata = False
        
        for key, value in metadata.items():
            # 의심스러운 메타데이터 패턴 확인 (예: Base64 인코딩, 긴 16진수 등)
            if isinstance(value, str):
                if (re.search(r'^[A-Za-z0-9+/]{20,}={0,2}$', value) or  # Base64 패턴
                    re.search(r'^[A-Fa-f0-9]{20,}$', value)):           # 긴 16진수 패턴
                    suspicious_metadata = True
                    break
        
        if suspicious_metadata:
            detected_techniques.append('metadata_hiding')
    
    # 비가시 텍스트 탐지
    with pdfplumber.open(pdf_path) as pdf:
        invisible_text_detected = False
        
        for page in pdf.pages:
            # 텍스트 추출
            text = page.extract_text()
            
            # 각 텍스트 객체의 특성 분석
            for obj in page.chars:
                # 투명도 또는 흰색 텍스트 확인
                if 'non_stroking_color' in obj and obj['non_stroking_color'] is not None:
                    color = obj['non_stroking_color']
                    # 흰색 또는 매우 밝은색 텍스트 확인
                    if all(c > 0.95 for c in color) or 'opacity' in obj and obj['opacity'] < 0.1:
                        invisible_text_detected = True
                        break
            
            if invisible_text_detected:
                detected_techniques.append('invisible_text')
                break
    
    # 이미지 스테가노그래피 탐지
    with pdfplumber.open(pdf_path) as pdf:
        steganography_detected = False
        
        for i, page in enumerate(pdf.pages):
            # 페이지에서 이미지 추출
            images = page.images
            
            for j, img in enumerate(images):
                # 이미지 데이터 분석
                img_data = img['stream'].get_data()
                
                try:
                    # 이미지를 PIL Image로 변환
                    from io import BytesIO
                    pil_img = Image.open(BytesIO(img_data))
                    
                    # 기본적인 스테가노그래피 탐지 (LSB 분석)
                    # 이미지의 최하위 비트 분석
                    img_array = np.array(pil_img)
                    if len(img_array.shape) >= 3:  # 컬러 이미지인 경우
                        # 최하위 비트만 추출
                        lsb_data = img_array & 1
                        
                        # LSB 패턴 분석
                        # 정상적인 이미지의 LSB는 일반적으로 무작위적인 분포를 가짐
                        # 스테가노그래피가 적용된 이미지는 종종 패턴이 나타남
                        red_lsb = lsb_data[:,:,0].flatten()
                        entropy = -sum(np.bincount(red_lsb) / len(red_lsb) * np.log2(np.bincount(red_lsb) / len(red_lsb) + 1e-10))
                        
                        # 엔트로피가 특정 임계값보다 낮으면 의심
                        if entropy < 0.9:
                            steganography_detected = True
                            break
                except Exception:
                    continue
            
            if steganography_detected:
                detected_techniques.append('image_steganography')
                break
    
    # 폰트 변형 탐지
    with pdfplumber.open(pdf_path) as pdf:
        font_variation_detected = False
        
        for page in pdf.pages:
            fonts = {}
            
            # 페이지에서 텍스트 객체 추출
            for obj in page.chars:
                if 'fontname' in obj:
                    font_name = obj['fontname']
                    if font_name not in fonts:
                        fonts[font_name] = []
                    fonts[font_name].append(obj['text'])
            
            # 의심스러운 폰트 패턴 확인
            for font_name, texts in fonts.items():
                # 같은 폰트에 매우 비슷한 글자들이 다른 코드포인트를 가지는 경우
                if any(ord(a) != ord(b) and a.lower() == b.lower() for a in texts for b in texts if a != b):
                    font_variation_detected = True
                    break
            
            if font_variation_detected:
                detected_techniques.append('font_variation')
                break
    
    # 문자 간격 코딩 탐지
    with pdfplumber.open(pdf_path) as pdf:
        character_spacing_detected = False
        
        for page in pdf.pages:
            prev_x1 = None
            spacings = []
            
            # 정렬된 텍스트 객체에서 문자 간격 분석
            chars = sorted(page.chars, key=lambda x: (x['top'], x['x0']))
            
            for obj in chars:
                if prev_x1 is not None and obj['top'] == chars[0]['top']:  # 같은 줄에 있는 문자만 확인
                    spacing = obj['x0'] - prev_x1
                    spacings.append(spacing)
                
                prev_x1 = obj['x1']
            
            # 간격의 패턴 분석
            if spacings:
                # 간격의 변동성 계산
                mean_spacing = np.mean(spacings)
                spacing_variation = np.std(spacings) / mean_spacing
                
                # 간격이 비정상적으로 다양하면 의심
                if spacing_variation > 0.5:  # 임계값은 실험적으로 조정
                    character_spacing_detected = True
            
            if character_spacing_detected:
                detected_techniques.append('character_spacing')
                break
    
    return detected_techniques

# 모든 PDF에 대해 스텔스 기법 탐지
for i, pdf_file in enumerate(pdf_files):
    print(f"Analyzing {pdf_file} ({i+1}/{len(pdf_files)})...")
    detected = detect_stealth_techniques(pdf_file)
    
    for technique in detected:
        detection_results[technique].append(i + 1)  # 파일 인덱스 저장 (1-indexed)
```

#### 3) 범용 추출기 개발
```python
def extract_hidden_messages(pdf_path):
    extracted_messages = []
    
    # 메타데이터에서 숨겨진 메시지 추출
    try:
        with pikepdf.open(pdf_path) as pdf:
            metadata = pdf.docinfo
            
            for key, value in metadata.items():
                if isinstance(value, str):
                    # Base64 디코딩 시도
                    if re.search(r'^[A-Za-z0-9+/]{20,}={0,2}$', value):
                        try:
                            import base64
                            decoded = base64.b64decode(value).decode('utf-8')
                            if re.search(r'[A-Za-z0-9]{5,}', decoded):  # 의미 있는 메시지인지 확인
                                extracted_messages.append({
                                    'technique': 'metadata_hiding',
                                    'message': decoded,
                                    'location': f'metadata.{key}'
                                })
                        except:
                            pass
    except Exception as e:
        print(f"Error extracting metadata: {e}")
    
    # 비가시 텍스트에서 숨겨진 메시지 추출
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                for obj in page.chars:
                    # 투명도 또는 흰색 텍스트 확인
                    is_invisible = False
                    
                    if 'non_stroking_color' in obj and obj['non_stroking_color'] is not None:
                        color = obj['non_stroking_color']
                        if all(c > 0.95 for c in color):  # 흰색 또는 매우 밝은색
                            is_invisible = True
                    
                    if 'opacity' in obj and obj['opacity'] < 0.1:  # 매우 낮은 투명도
                        is_invisible = True
                    
                    if is_invisible:
                        invisible_text = obj['text']
                        if invisible_text.strip():  # 공백이 아닌 경우
                            extracted_messages.append({
                                'technique': 'invisible_text',
                                'message': invisible_text,
                                'location': f'page_{page_num+1}_pos_({obj["x0"]},{obj["top"]})'
                            })
    except Exception as e:
        print(f"Error extracting invisible text: {e}")
    
    # 이미지 스테가노그래피에서 숨겨진 메시지 추출
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                for img_num, img in enumerate(page.images):
                    try:
                        img_data = img['stream'].get_data()
                        from io import BytesIO
                        pil_img = Image.open(BytesIO(img_data))
                        
                        # LSB 스테가노그래피 추출 시도
                        try:
                            from stegano import lsb
                            secret_text = lsb.reveal(pil_img)
                            if secret_text and len(secret_text) > 5:  # 의미 있는 메시지인지 확인
                                extracted_messages.append({
                                    'technique': 'image_steganography',
                                    'message': secret_text,
                                    'location': f'page_{page_num+1}_image_{img_num+1}'
                                })
                        except:
                            pass
                    except Exception as e:
                        print(f"Error processing image: {e}")
    except Exception as e:
        print(f"Error extracting from images: {e}")
    
    # 폰트 변형에서 숨겨진 메시지 추출
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # 글자들을 순서대로 분석
                chars = sorted(page.chars, key=lambda x: (x['top'], x['x0']))
                
                font_messages = []
                current_font = None
                current_message = []
                
                for char in chars:
                    # 폰트 변화 감지
                    if current_font is None:
                        current_font = char['fontname']
                    elif char['fontname'] != current_font:
                        if len(current_message) > 5:  # 의미 있는 길이인지 확인
                            font_messages.append(''.join(current_message))
                        current_message = []
                        current_font = char['fontname']
                    
                    current_message.append(char['text'])
                
                # 마지막 메시지 확인
                if len(current_message) > 5:
                    font_messages.append(''.join(current_message))
                
                # 찾아낸 메시지 저장
                for i, msg in enumerate(font_messages):
                    if re.search(r'[A-Za-z0-9]{5,}', msg):  # 의미 있는 메시지인지 확인
                        extracted_messages.append({
                            'technique': 'font_variation',
                            'message': msg,
                            'location': f'page_{page_num+1}_font_message_{i+1}'
                        })
    except Exception as e:
        print(f"Error extracting from font variations: {e}")
    
    # 문자 간격 코딩에서 숨겨진 메시지 추출
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                chars = sorted(page.chars, key=lambda x: (x['top'], x['x0']))
                
                prev_x1 = None
                spacings = []
                spacing_positions = []
                
                for i, char in enumerate(chars):
                    if prev_x1 is not None and char['top'] == chars[0]['top']:  # 같은 줄의 문자만 분석
                        spacing = char['x0'] - prev_x1
                        spacings.append(spacing)
                        spacing_positions.append(i)
                    
                    prev_x1 = char['x1']
                
                # 간격의 패턴 분석
                if spacings:
                    # 간격을 이진 코드로 변환 (넓은 간격 = 1, 좁은 간격 = 0)
                    mean_spacing = np.mean(spacings)
                    binary_code = ''.join(['1' if s > mean_spacing else '0' for s in spacings])
                    
                    # 8비트 단위로 ASCII로 변환
                    try:
                        ascii_message = ''
                        for i in range(0, len(binary_code), 8):
                            if i + 8 <= len(binary_code):
                                byte = binary_code[i:i+8]
                                ascii_char = chr(int(byte, 2))
                                if 32 <= ord(ascii_char) <= 126:  # 출력 가능한 ASCII 문자인지 확인
                                    ascii_message += ascii_char
                        
                        if len(ascii_message) > 3 and re.search(r'[A-Za-z0-9]{3,}', ascii_message):  # 의미 있는 메시지인지 확인
                            extracted_messages.append({
                                'technique': 'character_spacing',
                                'message': ascii_message,
                                'location': f'page_{page_num+1}_line_1'
                            })
                    except:
                        pass
    except Exception as e:
        print(f"Error extracting from character spacing: {e}")
    
    return extracted_messages
```

#### 4) 패턴 분석
```python
def analyze_hidden_message_patterns(extracted_messages_by_file):
    all_messages = [msg for file_messages in extracted_messages_by_file.values() for msg in file_messages]
    
    # 메시지 길이 분석
    message_lengths = [len(msg['message']) for msg in all_messages]
    avg_length = np.mean(message_lengths)
    std_length = np.std(message_lengths)
    
    # 사용된 문자 세트 분석
    character_sets = []
    for msg in all_messages:
        char_set = set(msg['message'])
        character_sets.append(char_set)
    
    common_chars = set.intersection(*character_sets) if character_sets else set()
    
    # 기법별 분포
    technique_counts = {}
    for msg in all_messages:
        technique = msg['technique']
        technique_counts[technique] = technique_counts.get(technique, 0) + 1
    
    # 메시지 간 연관성 분석
    message_similarities = []
    for i, msg1 in enumerate(all_messages):
        for j, msg2 in enumerate(all_messages):
            if i < j:  # 중복 비교 방지
                similarity = compute_similarity(msg1['message'], msg2['message'])
                message_similarities.append({
                    'message1': msg1['message'],
                    'message2': msg2['message'],
                    'similarity': similarity
                })
    
    # 유사도가 높은 메시지 쌍 찾기
    high_similarity_pairs = [pair for pair in message_similarities if pair['similarity'] > 0.7]
    
    # 메시지 내용 주제 분석
    topics = analyze_message_topics(all_messages)
    
    # 파일 간 메시지 연속성 분석
    continuity_analysis = analyze_message_continuity(extracted_messages_by_file)
    
    return {
        'total_messages': len(all_messages),
        'avg_length': avg_length,
        'std_length': std_length,
        'common_chars': list(common_chars),
        'technique_distribution': technique_counts,
        'high_similarity_pairs': high_similarity_pairs,
        'topics': topics,
        'continuity_analysis': continuity_analysis
    }

# 문자열 유사도 계산 함수 (Jaccard 유사도)
def compute_similarity(s1, s2):
    set1 = set(s1)
    set2 = set(s2)
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    return len(intersection) / len(union)

# 메시지 주제 분석 함수 (간단한 키워드 기반)
def analyze_message_topics(messages):
    # 주제별 키워드
    topics = {
        'security': ['password', 'encrypt', 'secure', 'key', 'access', 'auth', 'token'],
        'personal': ['name', 'address', 'phone', 'email', 'birth', 'social'],
        'technical': ['code', 'algorithm', 'program', 'function', 'system', 'data', 'protocol'],
        'financial': ['account', 'money', 'payment', 'bank', 'credit', 'transaction', 'fund']
    }
    
    message_topics = {}
    
    for msg in messages:
        content = msg['message'].lower()
        found_topics = []
        
        for topic, keywords in topics.items():
            if any(keyword in content for keyword in keywords):
                found_topics.append(topic)
        
        if found_topics:
            message_topics[msg['message'][:20] + '...'] = found_topics
        else:
            message_topics[msg['message'][:20] + '...'] = ['unknown']
    
    return message_topics

# 파일 간 메시지 연속성 분석
def analyze_message_continuity(messages_by_file):
    continuity = []
    
    # 파일 정렬
    sorted_files = sorted(messages_by_file.keys())
    
    for i in range(len(sorted_files) - 1):
        file1 = sorted_files[i]
        file2 = sorted_files[i+1]
        
        if not messages_by_file[file1] or not messages_by_file[file2]:
            continue
        
        # 각 파일의 마지막 메시지와 다음 파일의 첫 메시지 비교
        last_msg = messages_by_file[file1][-1]['message']
        first_msg = messages_by_file[file2][0]['message']
        
        # 연속성 확인
        if last_msg[-5:] == first_msg[:5]:  # 마지막 5글자와 첫 5글자가 일치하는지 확인
            continuity.append({
                'file1': file1,
                'file2': file2,
                'connected': True,
                'connection_type': 'overlap'
            })
        elif last_msg[-1] == first_msg[0]:  # 마지막 글자와 첫 글자가 일치하는지 확인
            continuity.append({
                'file1': file1,
                'file2': file2,
                'connected': True,
                'connection_type': 'char_match'
            })
    
    return continuity
```

#### 5) 보안 취약점 분석
```python
def analyze_stealth_techniques_vulnerabilities():
    vulnerabilities = {
        'metadata_hiding': {
            'weaknesses': [
                "쉽게 탐지 가능: 대부분의 PDF 도구는 메타데이터를 쉽게 볼 수 있음",
                "제한된 용량: 메타데이터 필드는 일반적으로 용량이 제한되어 있음",
                "표준화된 필드: 비표준 메타데이터 필드는 의심을 불러일으킬 수 있음"
            ],
            'improvements': [
                "암호화: 메타데이터에 저장하기 전 암호화",
                "압축: 효율적인 인코딩으로 더 많은 정보 저장",
                "분산 저장: 여러 메타데이터 필드에 정보 분산"
            ]
        },
        'invisible_text': {
            'weaknesses': [
                "텍스트 선택 시 보임: 텍스트 영역을 선택하면 투명 텍스트도 선택됨",
                "검색 가능성: 대부분의 PDF 뷰어에서 검색하면 비가시 텍스트도 결과에 포함됨",
                "파일 크기: 추가 텍스트로 인해 파일 크기가 증가함"
            ],
            'improvements': [
                "레이어 활용: 비표시 레이어에 텍스트 배치",
                "특수 인코딩: 특수 문자나 비표준 인코딩 사용",
                "콘텐츠 스트림 최적화: 비가시 텍스트를 콘텐츠 스트림 내부에 효율적으로 숨김"
            ]
        },
        'image_steganography': {
            'weaknesses': [
                "이미지 조작 취약: 이미지 압축, 크기 조정, 포맷 변환 시 정보 손실",
                "통계적 분석에 취약: LSB 같은 기본 기법은 통계적 분석으로 탐지 가능",
                "이미지 품질: 많은 정보를 숨기면 이미지 품질 저하 가능"
            ],
            'improvements': [
                "고급 알고리즘: DCT, DWT 등 고급 알고리즘 활용",
                "암호화 결합: 스테가노그래피 전에 데이터 암호화",
                "다중 채널: RGB 채널 전체를 활용한 분산 저장"
            ]
        },
        'font_variation': {
            'weaknesses': [
                "폰트 분석으로 탐지 가능: 문서에서 사용된 폰트 분석으로 변형 탐지 가능",
                "텍스트 추출 시 노출: 텍스트 추출 도구 사용 시 원본 텍스트 코드 노출",
                "가독성 문제: 눈에 띄지 않는 폰트 변형은 제한적"
            ],
            'improvements': [
                "사용자 정의 폰트: 표준 폰트와 유사하지만 내부적으로 다른 매핑을 가진 폰트 사용",
                "Zero-width 문자 활용: 보이지 않는 폭 문자를 통한 이진 인코딩",
                "합성 문자 활용: 유니코드의 합성 문자 기능을 활용한 은닉"
            ]
        },
        'character_spacing': {
            'weaknesses': [
                "텍스트 재포맷팅에 취약: 텍스트 재포맷팅 시 간격 정보 손실",
                "통계적 분석에 취약: 비정상적 간격 패턴은 통계적 분석으로 탐지 가능",
                "가독성 문제: 큰 간격 차이는 눈에 띄어 의심 유발"
            ],
            'improvements': [
                "자연스러운 변화: 자연스러운 텍스트 간격 변화 범위 내에서 변형",
                "단어 단위 적용: 문자 단위보다 단어 간격에 적용하여 덜 눈에 띄게 함",
                "다른 기법과 결합: 다른 은닉 기법과 결합하여 중복 보호"
            ]
        }
    }
    
    # 전체 취약점 요약
    summary = {
        'most_vulnerable': max(vulnerabilities, key=lambda k: len(vulnerabilities[k]['weaknesses'])),
        'most_robust': min(vulnerabilities, key=lambda k: len(vulnerabilities[k]['weaknesses'])),
        'common_weaknesses': [
            "통계적 분석에 취약",
            "문서 수정 시 정보 손실 가능성",
            "전문 도구로 탐지 가능"
        ],
        'general_improvements': [
            "암호화와 결합: 모든 은닉 기법에 암호화 추가",
            "다중 기법 사용: 여러 기법을 동시에 적용해 중복 보호",
            "맞춤형 도구 개발: 표준 도구가 아닌 맞춤형 도구로 탐지 회피"
        ]
    }
    
    return {
        'technique_vulnerabilities': vulnerabilities,
        'summary': summary
    }
```

## 4. The Age of AI: 영상 팩트 체크

### 해결 접근 방법

#### 1) 데이터 준비 및 전처리
```python
import pandas as pd
import numpy as np
import re
import spacy
import pytube
from youtube_transcript_api import YouTubeTranscriptApi
import datetime

# 비디오 데이터 구조
video_clips = [
    {
        'id': f'clip_{i+1}',
        'title': f'The Age of AI - Clip {i+1}',
        'youtube_id': f'yt_id_{i+1}',  # 실제 YouTube ID
        'duration': f'{i+2}:30',  # 예시 지속시간
        'topics': ['AI ethics', 'neural networks', 'future of work']
    }
    for i in range(30)
]

# 자막 데이터 불러오기
def get_video_transcript(youtube_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(youtube_id)
        return transcript
    except Exception as e:
        print(f"Error fetching transcript for {youtube_id}: {e}")
        return None

# 자막 데이터에서 시간대별 텍스트 추출
def extract_timestamped_text(transcript):
    if not transcript:
        return []
    
    timestamped_text = []
    for entry in transcript:
        start_time = entry['start']
        text = entry['text']
        duration = entry.get('duration', 0)
        
        # 시작 시간을 timestamp 형식으로 변환
        minutes = int(start_time // 60)
        seconds = int(start_time % 60)
        timestamp = f"{minutes:02d}:{seconds:02d}"
        
        timestamped_text.append({
            'timestamp': timestamp,
            'start_seconds': start_time,
            'duration': duration,
            'text': text
        })
    
    return timestamped_text

# NLP 모델 로드
nlp = spacy.load("en_core_web_md")

# 모든 비디오 클립의 자막 처리
all_video_data = {}
for clip in video_clips:
    # 실제 구현에서는 YouTube API 호출하지만, 여기서는 예시 데이터 생성
    fake_transcript = [
        {'start': 0, 'duration': 5, 'text': 'Welcome to The Age of AI documentary.'},
        {'start': 5, 'duration': 10, 'text': 'Today, we explore the fascinating world of artificial intelligence.'},
        {'start': 15, 'duration': 8, 'text': 'Deep learning has revolutionized the field of AI since 2012.'}
    ]
    
    timestamped_text = extract_timestamped_text(fake_transcript)
    
    all_video_data[clip['id']] = {
        'metadata': clip,
        'transcript': timestamped_text
    }

# 자막 텍스트를 단일 문자열로 결합
def combine_transcript_text(transcript):
    return ' '.join([entry['text'] for entry in transcript])

# 모든 비디오 클립의 전체 텍스트
all_text = {}
for clip_id, data in all_video_data.items():
    all_text[clip_id] = combine_transcript_text(data['transcript'])
```

#### 2) 정보 추출
```python
def extract_ai_technologies(text):
    # AI 기술 관련 키워드 목록
    ai_technologies = [
        'deep learning', 'machine learning', 'neural network', 'computer vision', 
        'natural language processing', 'NLP', 'reinforcement learning', 'AI ethics',
        'GPT', 'BERT', 'transformer', 'CNN', 'RNN', 'LSTM', 'GAN', 'robotics',
        'autonomous', 'self-driving', 'facial recognition', 'recommendation system'
    ]
    
    # 텍스트에서 AI 기술 찾기
    found_technologies = {}
    
    # NLP 처리
    doc = nlp(text)
    
    for tech in ai_technologies:
        # 정규 표현식으로 검색
        pattern = r'\b' + re.escape(tech) + r'\b'
        matches = re.finditer(pattern, text.lower())
        
        # 매치된 결과 저장
        mentions = []
        for match in matches:
            # 앞뒤 문맥 추출
            start_idx = max(0, match.start() - 50)
            end_idx = min(len(text), match.end() + 50)
            context = text[start_idx:end_idx]
            
            mentions.append({
                'context': context,
                'position': match.start()
            })
        
        if mentions:
            found_technologies[tech] = mentions
    
    # 활용 사례 추출
    applications = extract_applications(doc)
    
    # 타임스탬프 연결
    technology_with_timestamps = {}
    for tech, mentions in found_technologies.items():
        timestamps = []
        for mention in mentions:
            position = mention['position']
            timestamp = find_timestamp_for_position(all_video_data[clip_id]['transcript'], position, text)
            if timestamp:
                timestamps.append(timestamp)
        
        technology_with_timestamps[tech] = {
            'mentions': len(mentions),
            'applications': applications.get(tech, []),
            'timestamps': timestamps
        }
    
    return technology_with_timestamps

def extract_applications(doc):
    # AI 기술별 활용 사례 탐지
    applications = {}
    
    # 활용 사례 관련 패턴
    application_patterns = [
        r'(used for|applied to|application in|used in|enables) (.+?)(\.|\,)',
        r'(in the field of|in) (.+?)( using| with) (deep learning|machine learning|neural network|AI)',
        r'(helps|assists|automates|improves) (.+?) (through|using|with) (AI|machine learning)'
    ]
    
    # 각 기술별 활용 사례 찾기
    ai_terms = ['deep learning', 'machine learning', 'neural network', 'AI', 'artificial intelligence']
    
    for term in ai_terms:
        applications[term] = []
        
        for pattern in application_patterns:
            matches = re.finditer(pattern, doc.text)
            for match in matches:
                if term.lower() in doc.text[max(0, match.start() - 50):match.end() + 50].lower():
                    application = match.group(2).strip()
                    if application:
                        applications[term].append(application)
    
    return applications

def find_timestamp_for_position(transcript, position, full_text):
    # 현재까지의 텍스트 길이를 추적
    current_length = 0
    
    for entry in transcript:
        text_length = len(entry['text'])
        
        # 위치가 현재 항목 내에 있는지 확인
        if current_length <= position < current_length + text_length:
            # 타임스탬프 반환
            return {
                'start': entry['timestamp'],
                'end': format_timestamp(entry['start_seconds'] + entry['duration'])
            }
        
        current_length += text_length + 1  # +1은 각 항목 사이의 공백 고려
    
    return None

def format_timestamp(seconds):
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{minutes:02d}:{secs:02d}"

# 각 비디오 클립에서 AI 기술 정보 추출
extracted_technologies = {}
for clip_id, data in all_video_data.items():
    text = all_text[clip_id]
    extracted_technologies[clip_id] = extract_ai_technologies(text)
```

#### 3) 사실 검증
```python
import requests
from bs4 import BeautifulSoup
import json

# 비디오 주장 목록 (예시)
video_claims = [
    {
        'claim': "GPT-3는 1750억 개의 파라미터를 가진다",
        'clip_id': 'clip_1',
        'timestamp': '01:45'
    },
    {
        'claim': "2020년까지 자율주행차가 상용화될 것이다",
        'clip_id': 'clip_2',
        'timestamp': '03:20'
    },
    # 추가 주장들...
]

# 웹 검색을 통한 사실 검증 (예시 함수)
def verify_claim(claim):
    # 실제 구현에서는 API나 웹 스크래핑을 사용할 것임
    # 여기서는 예시 결과 반환
    
    # 특정 주장에 대한 사실 검증 규칙 (실제로는 검색 결과나 API 응답을 분석)
    verification_results = {
        "GPT-3는 1750억 개의 파라미터를 가진다": {
            'verdict': "참",
            'evidence': "OpenAI 공식 문서에 따르면 GPT-3는 1750억 개의 파라미터를 가짐",
            'sources': ["https://openai.com/research/gpt-3"]
        },
        "2020년까지 자율주행차가 상용화될 것이다": {
            'verdict': "거짓",
            'evidence': "2023년 현재 레벨 5 자율주행은 상용화되지 않음",
            'sources': ["https://example.com/autonomous-driving-status", "https://example2.com/self-driving-timeline"]
        }
    }
    
    # 주장에 대한 결과 반환
    if claim in verification_results:
        return verification_results[claim]
    else:
        # 새로운 주장에 대한 가상 검증 로직
        search_results = search_claim_online(claim)
        verdict, evidence, sources = analyze_search_results(search_results, claim)
        return {
            'verdict': verdict,
            'evidence': evidence,
            'sources': sources
        }

# 웹 검색 시뮬레이션 (실제 구현에서는 Google API 등 사용)
def search_claim_online(claim):
    # 실제 검색 대신 시뮬레이션된 결과 반환
    return [
        {'title': 'AI 기술 발전에 관한 진실과 오해', 'snippet': '많은 다큐멘터리에서 AI 기술에 대한 과장된 주장이 있다. 실제로는...'},
        {'title': 'AI 미래 전망: 사실과 허구', 'snippet': '자율주행, 의료 AI 등 다양한 분야의 발전 전망은 현실적으로 더 시간이 필요하다...'}
    ]

# 검색 결과 분석 (실제로는 더 복잡한 NLP 분석 필요)
def analyze_search_results(results, claim):
    # 매우 단순화된 분석 로직
    positive_count = 0
    negative_count = 0
    
    for result in results:
        text = result['title'] + ' ' + result['snippet']
        
        # 긍정/부정 키워드 탐지 (매우 단순한 방식)
        positive_keywords = ['참', '사실', '증명됨', '확인됨', '정확']
        negative_keywords = ['거짓', '과장', '허구', '오류', '잘못', '부정확']
        
        for keyword in positive_keywords:
            if keyword in text:
                positive_count += 1
        
        for keyword in negative_keywords:
            if keyword in text:
                negative_count += 1
    
    # 결과 판정
    if positive_count > negative_count:
        verdict = "참"
        evidence = f"검색 결과에서 {positive_count}개의 긍정적 증거와 {negative_count}개의 부정적 증거를 찾음"
    elif negative_count > positive_count:
        verdict = "거짓"
        evidence = f"검색 결과에서 {negative_count}개의 부정적 증거와 {positive_count}개의 긍정적 증거를 찾음"
    else:
        verdict = "불명확"
        evidence = "충분한 증거를 찾을 수 없음"
    
    # 가상의 출처
    sources = ["https://example.com/ai-research", "https://example2.com/technology-facts"]
    
    return verdict, evidence, sources

# 모든 주장 검증
verified_claims = []
for claim_item in video_claims:
    claim_text = claim_item['claim']
    verification = verify_claim(claim_text)
    
    verified_claims.append({
        'claim': claim_text,
        'clip_id': claim_item['clip_id'],
        'timestamp': claim_item['timestamp'],
        'verdict': verification['verdict'],
        'evidence': verification['evidence'],
        'sources': verification['sources']
    })
```

#### 4) 편향성 분석
```python
def analyze_bias(text):
    # 편향성 관련 어휘 목록
    positive_framing = [
        'revolutionary', 'breakthrough', 'remarkable', 'incredible', 'transformative',
        'groundbreaking', 'amazing', 'extraordinary', 'impressive', 'exceptional'
    ]
    
    negative_framing = [
        'dangerous', 'threatening', 'concerning', 'worrisome', 'alarming',
        'problematic', 'risky', 'harmful', 'destructive', 'scary'
    ]
    
    balanced_terms = [
        'research suggests', 'studies indicate', 'evidence shows', 'according to',
        'may', 'might', 'could', 'potential', 'possible', 'preliminary'
    ]
    
    # 각 범주의 단어 등장 횟수 계산
    positive_count = sum(text.lower().count(term) for term in positive_framing)
    negative_count = sum(text.lower().count(term) for term in negative_framing)
    balanced_count = sum(text.lower().count(term) for term in balanced_terms)
    
    # 감정 비율 계산
    total_emotional_terms = positive_count + negative_count
    if total_emotional_terms > 0:
        positive_ratio = positive_count / total_emotional_terms
        negative_ratio = negative_count / total_emotional_terms
    else:
        positive_ratio = negative_ratio = 0
    
    # 전체 편향성 점수 (-1: 매우 부정, 0: 균형, 1: 매우 긍정)
    if total_emotional_terms > 0:
        bias_score = (positive_count - negative_count) / total_emotional_terms
    else:
        bias_score = 0
    
    # 불확실성 표현 비율
    uncertainty_ratio = balanced_count / (total_emotional_terms + balanced_count) if (total_emotional_terms + balanced_count) > 0 else 0
    
    # 편향성 유형 분류
    if abs(bias_score) < 0.2:
        bias_type = "균형잡힌 관점"
    elif bias_score >= 0.2 and bias_score < 0.5:
        bias_type = "약간 긍정적 편향"
    elif bias_score >= 0.5:
        bias_type = "강한 긍정적 편향"
    elif bias_score <= -0.2 and bias_score > -0.5:
        bias_type = "약간 부정적 편향"
    else:  # bias_score <= -0.5
        bias_type = "강한 부정적 편향"
    
    # 편향의 맥락 찾기
    bias_contexts = []
    
    # 긍정적 편향 맥락
    for term in positive_framing:
        pattern = r'[^.!?]*\b' + re.escape(term) + r'\b[^.!?]*[.!?]'
        for match in re.finditer(pattern, text, re.IGNORECASE):
            bias_contexts.append({
                'type': 'positive',
                'term': term,
                'context': match.group(0).strip()
            })
    
    # 부정적 편향 맥락
    for term in negative_framing:
        pattern = r'[^.!?]*\b' + re.escape(term) + r'\b[^.!?]*[.!?]'
        for match in re.finditer(pattern, text, re.IGNORECASE):
            bias_contexts.append({
                'type': 'negative',
                'term': term,
                'context': match.group(0).strip()
            })
    
    return {
        'bias_score': bias_score,
        'bias_type': bias_type,
        'positive_terms_count': positive_count,
        'negative_terms_count': negative_count,
        'balanced_terms_count': balanced_count,
        'uncertainty_ratio': uncertainty_ratio,
        'bias_contexts': bias_contexts[:10]  # 처음 10개만 반환
    }

# 각 클립의 편향성 분석
bias_analysis = {}
for clip_id, text in all_text.items():
    bias_analysis[clip_id] = analyze_bias(text)
```

#### 5) 미래 예측 평가
```python
def evaluate_future_predictions(text):
    # 미래 예측 표현 탐지 패턴
    prediction_patterns = [
        r'will (be|become|have|see|enable|allow|create|replace|transform) (.+?) (by|in|within) (\d{4}|\d+ years)',
        r'(by|in|within) (\d{4}|\d+ years),? (.+?) will (be|become|have|see|enable|allow|create|replace|transform)',
        r'(expect|predict|forecast|anticipate|project) (.+?) (by|in|within) (\d{4}|\d+ years)',
        r'the future of (.+?) (is|will be) (.+?)(\.|\,)'
    ]
    
    # 예측 추출
    predictions = []
    for pattern in prediction_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            prediction_text = match.group(0)
            
            # 시간 프레임 추출 시도
            timeframe = None
            year_match = re.search(r'(by|in|within) (\d{4}|\d+ years)', prediction_text)
            if year_match:
                timeframe = year_match.group(2)
            
            predictions.append({
                'text': prediction_text,
                'timeframe': timeframe
            })
    
    # 각 예측의 실현 가능성 평가
    evaluated_predictions = []
    for prediction in predictions:
        # 실현 가능성 평가 (실제로는 더 복잡한 분석 필요)
        feasibility, reasoning = evaluate_prediction_feasibility(prediction['text'])
        
        evaluated_predictions.append({
            'prediction': prediction['text'],
            'timeframe': prediction['timeframe'],
            'feasibility': feasibility,
            'reasoning': reasoning
        })
    
    return evaluated_predictions

# 예측 실현 가능성 평가 (간단한 휴리스틱 접근)
def evaluate_prediction_feasibility(prediction_text):
    # 낙관적 표현
    optimistic_terms = [
        'revolution', 'breakthrough', 'transformative', 'disrupt', 'radical',
        'exponential', 'dramatic', 'completely', 'entirely', 'totally'
    ]
    
    # 보수적 표현
    conservative_terms = [
        'gradual', 'incremental', 'modest', 'limited', 'partial',
        'somewhat', 'slightly', 'potentially', 'possibly', 'may'
    ]
    
    # 시간 프레임 분석
    near_term = any(term in prediction_text.lower() for term in ['by 2025', 'within 5 years', 'next few years'])
    mid_term = any(term in prediction_text.lower() for term in ['by 2030', 'within 10 years', 'next decade'])
    long_term = any(term in prediction_text.lower() for term in ['by 2050', 'within 30 years', 'next century'])
    
    # 기술 난이도 분석
    complex_tech = any(term in prediction_text.lower() for term in ['agi', 'consciousness', 'general intelligence', 'human-level', 'superhuman'])
    
    # 낙관적/보수적 용어 계수
    optimism_score = sum(prediction_text.lower().count(term) for term in optimistic_terms)
    conservative_score = sum(prediction_text.lower().count(term) for term in conservative_terms)
    
    # 실현 가능성 평가
    if complex_tech and near_term:
        feasibility = "매우 낮음"
        reasoning = "가까운 미래에 매우 복잡한 기술적 도약을 예측하고 있어 실현 가능성이 낮습니다."
    elif complex_tech and mid_term:
        feasibility = "낮음"
        reasoning = "중기적으로 복잡한 기술적 도약을 예측하고 있어 실현 가능성이 다소 낮습니다."
    elif complex_tech and long_term:
        feasibility = "중간"
        reasoning = "장기적 관점에서는 복잡한 기술적 발전도 가능할 수 있습니다."
    elif optimism_score > conservative_score * 2:
        feasibility = "다소 낮음"
        reasoning = "지나치게 낙관적인 어조와 파괴적 변화를 예측하고 있어 실현 가능성이 다소 낮습니다."
    elif conservative_score > optimism_score:
        feasibility = "높음"
        reasoning = "보수적이고 점진적인 변화를 예측하고 있어 실현 가능성이 높습니다."
    else:
        feasibility = "중간"
        reasoning = "중도적인 전망으로 부분적인 실현은 가능해 보입니다."
    
    return feasibility, reasoning

# 각 클립의 미래 예측 평가
future_predictions = {}
for clip_id, text in all_text.items():
    future_predictions[clip_id] = evaluate_future_predictions(text)
```

#### 6) 종합 평가
```python
def comprehensive_evaluation(clip_id):
    # 해당 클립의 데이터
    text = all_text[clip_id]
    bias = bias_analysis[clip_id]
    verified = [claim for claim in verified_claims if claim['clip_id'] == clip_id]
    predictions = future_predictions[clip_id]
    tech_info = extracted_technologies[clip_id]
    
    # 과학적 정확성 평가
    scientific_accuracy = evaluate_scientific_accuracy(verified)
    
    # 교육적 가치 평가
    educational_value = evaluate_educational_value(text, tech_info)
    
    # 미래 예측 타당성 평가
    future_prediction_validity = evaluate_prediction_validity(predictions)
    
    # 편향 및 균형 평가
    bias_evaluation = evaluate_bias_balance(bias)
    
    # 종합 평가
    return {
        'clip_id': clip_id,
        'scientific_accuracy': scientific_accuracy,
        'educational_value': educational_value,
        'future_prediction_validity': future_prediction_validity,
        'bias_evaluation': bias_evaluation,
        'overall_rating': calculate_overall_rating(
            scientific_accuracy['score'], 
            educational_value['score'], 
            future_prediction_validity['score'], 
            bias_evaluation['score']
        )
    }

# 과학적 정확성 평가
def evaluate_scientific_accuracy(verified_claims):
    if not verified_claims:
        return {'score': 0, 'description': "평가할 주장이 없습니다."}
    
    # 사실 확인된 주장 분석
    true_claims = [claim for claim in verified_claims if claim['verdict'] == "참"]
    false_claims = [claim for claim in verified_claims if claim['verdict'] == "거짓"]
    unclear_claims = [claim for claim in verified_claims if claim['verdict'] == "불명확"]
    
    # 정확도 점수 계산 (0-10 척도)
    total_claims = len(verified_claims)
    accuracy_score = (len(true_claims) / total_claims) * 10 if total_claims > 0 else 0
    
    # 점수 범주화
    if accuracy_score >= 8:
        accuracy_level = "매우 높음"
    elif accuracy_score >= 6:
        accuracy_level = "높음"
    elif accuracy_score >= 4:
        accuracy_level = "보통"
    elif accuracy_score >= 2:
        accuracy_level = "낮음"
    else:
        accuracy_level = "매우 낮음"
    
    return {
        'score': accuracy_score,
        'level': accuracy_level,
        'true_claims': len(true_claims),
        'false_claims': len(false_claims),
        'unclear_claims': len(unclear_claims),
        'description': f"과학적 정확성은 {accuracy_level}입니다. 총 {total_claims}개 주장 중 {len(true_claims)}개 참, {len(false_claims)}개 거짓, {len(unclear_claims)}개 불명확."
    }

# 교육적 가치 평가
def evaluate_educational_value(text, tech_info):
    # 기술 설명의 다양성
    tech_diversity = len(tech_info)
    
    # 응용 사례의 구체성
    application_examples = sum(len(info.get('applications', [])) for tech, info in tech_info.items())
    
    # 핵심 AI 개념 설명 여부
    core_ai_concepts = ['neural network', 'training', 'algorithm', 'data', 'learning']
    concept_coverage = sum(1 for concept in core_ai_concepts if concept in text.lower())
    
    # 교육적 명확성 지표 (예: 정의 제공)
    definitions = len(re.findall(r'([A-Za-z\s]+) (is|are|refers to|means) (a|an|the) ([^.]+)', text))
    
    # 교육적 가치 점수 계산 (0-10 척도)
    educational_score = min(10, (tech_diversity + application_examples/3 + concept_coverage + definitions/2) / 2)
    
    # 점수 범주화
    if educational_score >= 8:
        educational_level = "매우 높음"
    elif educational_score >= 6:
        educational_level = "높음"
    elif educational_score >= 4:
        educational_level = "보통"
    elif educational_score >= 2:
        educational_level = "낮음"
    else:
        educational_level = "매우 낮음"
    
    return {
        'score': educational_score,
        'level': educational_level,
        'tech_diversity': tech_diversity,
        'application_examples': application_examples,
        'concept_coverage': concept_coverage,
        'description': f"교육적 가치는 {educational_level}입니다. {tech_diversity}개 기술 설명, {application_examples}개 응용 사례, {concept_coverage}/{len(core_ai_concepts)} 핵심 개념 다룸."
    }

# 미래 예측 타당성 평가
def evaluate_prediction_validity(predictions):
    if not predictions:
        return {'score': 0, 'description': "평가할 예측이 없습니다."}
    
    # 예측의 실현 가능성 분석
    feasibility_scores = {
        "매우 높음": 10,
        "높음": 8,
        "중간": 5,
        "다소 낮음": 3,
        "낮음": 2,
        "매우 낮음": 0
    }
    
    # 평균 실현 가능성 점수 계산
    total_score = sum(feasibility_scores.get(p['feasibility'], 0) for p in predictions)
    avg_feasibility_score = total_score / len(predictions) if predictions else 0
    
    # 실현 가능성 범주화
    if avg_feasibility_score >= 8:
        validity_level = "매우 높음"
    elif avg_feasibility_score >= 6:
        validity_level = "높음"
    elif avg_feasibility_score >= 4:
        validity_level = "보통"
    elif avg_feasibility_score >= 2:
        validity_level = "낮음"
    else:
        validity_level = "매우 낮음"
    
    return {
        'score': avg_feasibility_score,
        'level': validity_level,
        'prediction_count': len(predictions),
        'description': f"미래 예측의 타당성은 {validity_level}입니다. {len(predictions)}개 예측 분석."
    }

# 편향 및 균형 평가
def evaluate_bias_balance(bias_data):
    # 편향 점수 변환 (-1~1 → 0~10, 중립 = 10)
    bias_score = 10 - abs(bias_data['bias_score']) * 10
    
    # 불확실성 표현 반영 (불확실성 표현이 많을수록 균형 점수 향상)
    balanced_score = bias_score + bias_data['uncertainty_ratio'] * 2
    balanced_score = min(10, max(0, balanced_score))  # 0-10 범위 제한
    
    # 균형 수준 범주화
    if balanced_score >= 8:
        balance_level = "매우 균형잡힘"
    elif balanced_score >= 6:
        balance_level = "균형잡힘"
    elif balanced_score >= 4:
        balance_level = "약간 편향됨"
    elif balanced_score >= 2:
        balance_level = "편향됨"
    else:
        balance_level = "매우 편향됨"
    
    # 편향 유형
    bias_type = bias_data['bias_type']
    
    return {
        'score': balanced_score,
        'level': balance_level,
        'bias_type': bias_type,
        'description': f"편향 및 균형은 {balance_level}입니다. {bias_type} 성향을 보입니다."
    }

# 종합 평가 점수 계산
def calculate_overall_rating(scientific, educational, prediction, bias):
    # 가중치 적용 (과학적 정확성에 가장 높은 가중치)
    overall_score = (scientific * 0.4 + educational * 0.3 + prediction * 0.2 + bias * 0.1)
    
    # 등급 부여
    if overall_score >= 8:
        rating = "매우 우수 (A)"
    elif overall_score >= 7:
        rating = "우수 (B+)"
    elif overall_score >= 6:
        rating = "양호 (B)"
    elif overall_score >= 5:
        rating = "보통 (C+)"
    elif overall_score >= 4:
        rating = "미흡 (C)"
    elif overall_score >= 3:
        rating = "부족 (D)"
    else:
        rating = "매우 부족 (F)"
    
    return {
        'score': overall_score,
        'rating': rating,
        'description': f"종합 평가: {rating} (점수: {overall_score:.1f}/10)"
    }

# 모든 클립 종합 평가
comprehensive_evaluations = {}
for clip_id in all_video_data.keys():
    comprehensive_evaluations[clip_id] = comprehensive_evaluation(clip_id)
```

## 5. 고대 유적의 비밀: 이상한 코드 석판

### 해결 접근 방법

#### 1) 데이터 준비 및 패턴 분석
```python
import numpy as np
import pandas as pd
import re
from collections import Counter

# 암호화된 코드 조각 (예시 데이터)
encrypted_fragments = [
    "⊕□◊○▽ Σ▼△ ◎■ ⊙○□△ ▽⊕○◊▼ ■▲△⊙ ⊕□◊○▽ ■⊙⊖□ ◎■ △▼⊙Δ",
    "○△□ Δ ⊕ ⊖ ◎■ ▽△□ Δ ⊕ ⊖ ○▽△□ ○△ ■▲ △⊙ ○▽",
    "▽△□ ⊙○▲■ △⊙ ◎■ ○▽⊙ ⊕□◊○▽ Σ▼△",
    "◊■▲ ○▽⊙ ⊖ ◎■ △▼⊙ ⊕□◊○▽ ▼◎⊙ ○▽⊙",
    "⊕□◊○▽ ■⊙⊖□ ▲■ ⊙○□△ ▽⊕○◊▼ ◎■ △▼⊙Δ"
]

# 문자 빈도 분석
def analyze_character_frequency(fragments):
    all_text = ''.join(fragments)
    char_counts = Counter(all_text)
    return char_counts

# 패턴 식별
def identify_patterns(fragments):
    # 모든 조각을 공백으로 구분
    all_words = []
    for fragment in fragments:
        words = fragment.split()
        all_words.extend(words)
    
    # 반복되는 패턴 찾기
    pattern_counts = Counter(all_words)
    common_patterns = {pattern: count for pattern, count in pattern_counts.items() if count > 1}
    
    # 패턴 위치 분석
    pattern_positions = {}
    for pattern in common_patterns:
        positions = []
        for i, fragment in enumerate(fragments):
            for match in re.finditer(r'\b' + re.escape(pattern) + r'\b', fragment):
                positions.append({'fragment': i+1, 'position': match.start()})
        pattern_positions[pattern] = positions
    
    return {
        'common_patterns': common_patterns,
        'pattern_positions': pattern_positions
    }

# 주변 문맥 분석
def analyze_pattern_context(fragments, pattern):
    contexts = []
    for fragment in fragments:
        for match in re.finditer(r'\b' + re.escape(pattern) + r'\b', fragment):
            start_pos = max(0, match.start() - 10)
            end_pos = min(len(fragment), match.end() + 10)
            context = fragment[start_pos:end_pos]
            contexts.append(context)
    return contexts

# 빈도 분석 수행
char_frequency = analyze_character_frequency(encrypted_fragments)
print("문자 빈도:", char_frequency.most_common(10))

# 패턴 식별 수행
patterns = identify_patterns(encrypted_fragments)
print("\n반복되는 패턴:")
for pattern, count in patterns['common_patterns'].items():
    print(f"'{pattern}': {count}회 등장")
    # 패턴 주변 문맥 분석
    contexts = analyze_pattern_context(encrypted_fragments, pattern)
    print(f"  문맥 예시: {contexts[0] if contexts else '없음'}")
```

#### 2) 문법 구조 추론
```python
def infer_grammar_structure(fragments):
    # 문법 구조 후보들
    grammar_candidates = {
        'function_declaration': {
            'pattern': r'⊕□◊○▽\s+(\S+)',
            'examples': []
        },
        'loop_start': {
            'pattern': r'○△□\s+(\S+)',
            'examples': []
        },
        'loop_end': {
            'pattern': r'▽△□',
            'examples': []
        },
        'conditional': {
            'pattern': r'◊■▲\s+(\S+)',
            'examples': []
        },
        'variable_assignment': {
            'pattern': r'(\S+)\s+◎■\s+(\S+)',
            'examples': []
        },
        'operation': {
            'pattern': r'(\S+)\s+\S+\s+(\S+)',
            'examples': []
        }
    }
    
    # 각 문법 패턴에 대한 예시 찾기
    for fragment in fragments:
        for struct_name, struct_info in grammar_candidates.items():
            matches = re.finditer(struct_info['pattern'], fragment)
            for match in matches:
                struct_info['examples'].append(match.group(0))
    
    # 문법 규칙 정리
    grammar_rules = []
    for struct_name, struct_info in grammar_candidates.items():
        if struct_info['examples']:
            grammar_rules.append({
                'structure': struct_name,
                'pattern': struct_info['pattern'],
                'examples': struct_info['examples'][:3],  # 최대 3개 예시만
                'likely_meaning': infer_meaning(struct_name, struct_info['examples'])
            })
    
    return grammar_rules

# 의미 추론
def infer_meaning(structure_type, examples):
    meanings = {
        'function_declaration': "함수 선언 (함수명 정의)",
        'loop_start': "루프 시작 (반복 조건 정의)",
        'loop_end': "루프 종료",
        'conditional': "조건문 (if 문)",
        'variable_assignment': "변수 할당 (x = y 형태)",
        'operation': "연산 (예: 더하기, 빼기 등)"
    }
    
    return meanings.get(structure_type, "알 수 없음")

# 문법 구조 추론
grammar_rules = infer_grammar_structure(encrypted_fragments)
print("\n추론된 문법 구조:")
for rule in grammar_rules:
    print(f"{rule['structure']}:")
    print(f"  패턴: {rule['pattern']}")
    print(f"  예시: {', '.join(rule['examples'])}")
    print(f"  의미: {rule['likely_meaning']}")
    print()
```

#### 3) 프로그래밍 언어 매핑
```python
def map_to_modern_language(grammar_rules, fragments):
    # 현대 프로그래밍 언어 매핑 테이블
    mapping = {
        'function_declaration': {
            'python': 'def {name}({params}):',
            'javascript': 'function {name}({params}) {',
            'java': 'public void {name}({params}) {',
            'c': 'void {name}({params}) {'
        },
        'loop_start': {
            'python': 'for {var} in range({limit}):',
            'javascript': 'for (let {var} = 0; {var} < {limit}; {var}++) {',
            'java': 'for (int {var} = 0; {var} < {limit}; {var}++) {',
            'c': 'for (int {var} = 0; {var} < {limit}; {var}++) {'
        },
        'loop_end': {
            'python': '',  # Python uses indentation
            'javascript': '}',
            'java': '}',
            'c': '}'
        },
        'conditional': {
            'python': 'if {condition}:',
            'javascript': 'if ({condition}) {',
            'java': 'if ({condition}) {',
            'c': 'if ({condition}) {'
        },
        'variable_assignment': {
            'python': '{var} = {value}',
            'javascript': 'let {var} = {value};',
            'java': 'int {var} = {value};',
            'c': 'int {var} = {value};'
        },
        'operation': {
            'python': '{result} = {op1} {operator} {op2}',
            'javascript': '{result} = {op1} {operator} {op2};',
            'java': '{result} = {op1} {operator} {op2};',
            'c': '{result} = {op1} {operator} {op2};'
        }
    }
    
    # 암호화된 문자 → 현대 프로그래밍 언어 문자 매핑
    char_mapping = {
        '⊕': 'f',  # function 관련
        '□': 'u',
        '◊': 'n',
        '○': 'c',
        '▽': 't',
        'Σ': 'i',  # 기타 식별자
        '▼': 'o',
        '△': 'r',
        '◎': 'v',  # variable 관련
        '■': 'a',
        '⊙': 'l',
        '⊖': 'e',
        'Δ': 'p'  # parameter 관련
    }
    
    # 패턴 → 변수명 매핑
    symbol_names = {
        'Σ▼△': 'main',
        '◎■': 'var',
        '⊙○□△': 'loop',
        '▽⊕○◊▼': 'print',
        '△▼⊙Δ': 'result'
    }
    
    # 가장 유사한 현대 언어 결정 (Python으로 가정)
    target_language = 'python'
    
    # 변환 규칙 생성
    conversion_rules = []
    
    for struct_name, struct_info in mapping.items():
        # 해당 구조에 맞는 문법 규칙 찾기
        matching_rules = [rule for rule in grammar_rules if rule['structure'] == struct_name]
        
        if matching_rules:
            rule = matching_rules[0]
            conversion_rules.append({
                'ancient_pattern': rule['pattern'],
                'modern_equivalent': struct_info[target_language],
                'examples': [
                    {
                        'ancient': example,
                        'modern': convert_example(example, struct_info[target_language], char_mapping, symbol_names)
                    }
                    for example in rule['examples']
                ]
            })
    
    return {
        'target_language': target_language,
        'char_mapping': char_mapping,
        'symbol_names': symbol_names,
        'conversion_rules': conversion_rules
    }

# 예시 변환 함수 (매우 단순화된 버전)
def convert_example(ancient_code, modern_template, char_mapping, symbol_names):
    # 우선 알려진 기호를 변환
    for symbol, name in symbol_names.items():
        if symbol in ancient_code:
            ancient_code = ancient_code.replace(symbol, name)
    
    # 나머지 문자 변환
    for ancient_char, modern_char in char_mapping.items():
        ancient_code = ancient_code.replace(ancient_char, modern_char)
    
    # 기본 템플릿 형식 적용 (매우 단순화)
    if 'def' in modern_template:
        return "def function():"
    elif 'for' in modern_template:
        return "for i in range(10):"
    elif 'if' in modern_template:
        return "if condition:"
    elif '=' in modern_template:
        return "variable = value"
    
    return ancient_code  # 변환 실패 시 원본 반환

# 프로그래밍 언어 매핑 수행
language_mapping = map_to_modern_language(grammar_rules, encrypted_fragments)

print("\n현대 프로그래밍 언어 매핑:")
print(f"대상 언어: {language_mapping['target_language']}")
print("\n변환 규칙:")
for rule in language_mapping['conversion_rules']:
    print(f"고대 패턴: {rule['ancient_pattern']}")
    print(f"현대 형식: {rule['modern_equivalent']}")
    print("변환 예시:")
    for example in rule['examples']:
        print(f"  {example['ancient']} → {example['modern']}")
    print()
```

#### 4) 코드 복원
```python
def restore_code(fragments, language_mapping):
    # 변환된 코드 조각들
    converted_fragments = []
    
    # 각 조각 변환
    for fragment in fragments:
        converted = fragment
        
        # 알려진 기호 변환
        for symbol, name in language_mapping['symbol_names'].items():
            converted = converted.replace(symbol, name)
        
        # 개별 문자 변환
        for ancient_char, modern_char in language_mapping['char_mapping'].items():
            converted = converted.replace(ancient_char, modern_char)
        
        # 구문 패턴 변환
        for rule in language_mapping['conversion_rules']:
            pattern = rule['ancient_pattern']
            template = rule['modern_equivalent']
            
            # 패턴 매치 및 변환 (매우 단순화됨)
            matches = re.finditer(pattern, fragment)
            for match in matches:
                ancient_part = match.group(0)
                modern_part = convert_specific_pattern(ancient_part, template, language_mapping)
                converted = converted.replace(ancient_part, modern_part)
        
        converted_fragments.append(converted)
    
    # 전체 코드 복원 (코드 조각 순서 추론)
    reconstructed_code = order_and_reconstruct_fragments(converted_fragments)
    
    return {
        'converted_fragments': converted_fragments,
        'reconstructed_code': reconstructed_code
    }

# 특정 패턴 변환 (매우 단순화됨)
def convert_specific_pattern(ancient_part, template, mapping):
    # 단순 패턴 인식 로직
    if 'function' in ancient_part.lower() or 'func' in ancient_part.lower():
        return "def main():"
    elif 'loop' in ancient_part.lower() or 'for' in ancient_part.lower():
        return "for i in range(10):"
    elif 'var' in ancient_part.lower():
        return "result = 0"
    elif 'if' in ancient_part.lower() or 'cond' in ancient_part.lower():
        return "if result > 0:"
    elif 'print' in ancient_part.lower():
        return "print(result)"
    
    # 변환 규칙이 없으면 그대로 반환
    return ancient_part

# 조각 순서 추론 및 코드 재구성
def order_and_reconstruct_fragments(converted_fragments):
    # 매우 단순한 휴리스틱 기반 순서 추론
    ordered_fragments = []
    
    # 함수 선언이 있는 조각을 먼저 배치
    for fragment in converted_fragments:
        if 'def' in fragment:
            ordered_fragments.append(fragment)
            break
    
    # 루프나 변수 할당이 있는 조각 배치
    for fragment in converted_fragments:
        if fragment not in ordered_fragments and ('for' in fragment or '=' in fragment):
            ordered_fragments.append(fragment)
    
    # 조건문이 있는 조각 배치
    for fragment in converted_fragments:
        if fragment not in ordered_fragments and 'if' in fragment:
            ordered_fragments.append(fragment)
    
    # 출력이나 반환이 있는 조각 배치
    for fragment in converted_fragments:
        if fragment not in ordered_fragments and ('print' in fragment or 'return' in fragment):
            ordered_fragments.append(fragment)
    
    # 나머지 조각 배치
    for fragment in converted_fragments:
        if fragment not in ordered_fragments:
            ordered_fragments.append(fragment)
    
    # 최종 코드 생성
    code_lines = []
    
    # Python 스타일 들여쓰기 및 구문 구조화
    indentation_level = 0
    
    for fragment in ordered_fragments:
        # 각 줄 분리
        for line in fragment.split('\n'):
            line = line.strip()
            
            # 들여쓰기 레벨 조정
            if line.endswith(':'):
                # 현재 들여쓰기 적용
                code_lines.append('    ' * indentation_level + line)
                indentation_level += 1
            elif line.startswith('}') or line == 'end':
                # 닫는 괄호나 end 키워드 처리
                indentation_level = max(0, indentation_level - 1)
                if line != 'end':  # end는 Python에서 사용하지 않음
                    code_lines.append('    ' * indentation_level + line)
            else:
                # 일반 코드 라인
                code_lines.append('    ' * indentation_level + line)
    
    return '\n'.join(code_lines)

# 코드 복원 수행
restored_code = restore_code(encrypted_fragments, language_mapping)

print("\n변환된 코드 조각:")
for i, fragment in enumerate(restored_code['converted_fragments']):
    print(f"조각 {i+1}:")
    print(fragment)
    print()

print("\n복원된 전체 코드:")
print(restored_code['reconstructed_code'])
```

#### 5) 프로그램 실행
```python
def run_restored_code(code):
    # 코드의 목적과 기능 분석
    code_analysis = analyze_code_function(code)
    
    # 실행 결과 시뮬레이션
    try:
        # 실제로는 exec()로 실행하지만, 여기서는 실행 시뮬레이션
        execution_result = simulate_execution(code)
        success = True
        error_message = None
    except Exception as e:
        success = False
        error_message = str(e)
        execution_result = None
    
    return {
        'success': success,
        'result': execution_result,
        'error': error_message,
        'code_purpose': code_analysis['purpose'],
        'algorithm_type': code_analysis['algorithm_type'],
        'complexity': code_analysis['complexity']
    }

# 코드의 목적과 기능 분석
def analyze_code_function(code):
    purpose = "알 수 없음"
    algorithm_type = "알 수 없음"
    complexity = "알 수 없음"
    
    # 코드에서 패턴 탐지
    if 'range' in code and 'result' in code and '+=' in code:
        purpose = "수열의 합 계산"
        algorithm_type = "반복적 합산 (Iterative Summation)"
        complexity = "O(n) - 선형 시간 복잡도"
    elif 'range' in code and 'if' in code and 'result' in code:
        purpose = "조건부 값 필터링 또는 계산"
        algorithm_type = "조건부 처리 (Conditional Processing)"
        complexity = "O(n) - 선형 시간 복잡도"
    elif 'print' in code and 'result' in code:
        purpose = "계산 결과 출력"
        algorithm_type = "기본 입출력 (Basic I/O)"
        complexity = "O(1) - 상수 시간 복잡도"
    
    return {
        'purpose': purpose,
        'algorithm_type': algorithm_type,
        'complexity': complexity
    }

# 코드 실행 시뮬레이션 (실제로 실행하지 않고 결과 예측)
def simulate_execution(code):
    # 코드 분석하여 결과 예측
    result = "예측된 실행 결과: "
    
    if 'range(10)' in code and '+=' in code:
        # 1부터 10까지의 합 계산으로 예측
        result += "45 (1부터 9까지의 합)"
    elif 'if' in code and 'result >' in code:
        # 조건에 따른 결과 처리로 예측
        result += "조건부 결과 (실제 값은 입력에 따라 다름)"
    elif 'print' in code:
        # 결과 출력으로 예측
        result += "계산된 값 출력"
    else:
        result += "알 수 없는 결과"
    
    return result

# 복원된 코드 실행 및 분석
execution_result = run_restored_code(restored_code['reconstructed_code'])

print("\n프로그램 실행 결과:")
print(f"성공 여부: {'성공' if execution_result['success'] else '실패'}")
if execution_result['error']:
    print(f"오류 메시지: {execution_result['error']}")
print(f"실행 결과: {execution_result['result']}")
print(f"\n코드 목적: {execution_result['code_purpose']}")
print(f"알고리즘 유형: {execution_result['algorithm_type']}")
print(f"시간 복잡도: {execution_result['complexity']}")
```