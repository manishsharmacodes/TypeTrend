# TypeTrend — Typing Speed Pattern Predictor
> *Type Smarter. Track Progress. Predict Growth.*

TypeTrend is a responsive, modern full-stack web application designed to track typing performance, analyze practice trajectory, and forecast future typing speed using genuine machine learning.

---

## 🌟 Key Features

1. **Interactive Real-Time Typing Test:**
   - 4 passage categories: General English, Technology, Programming code idioms, and Beginner practice.
   - Configurable test durations (30s, 60s, 120s).
   - Dynamic countdown timer triggered on the first keystroke.
   - Smooth character-by-character live visual feedback (green for correct, red underline for typos, blinking glowing cursor on active character).
   - Floating live HUD displaying WPM, accuracy, character counts, and countdown.
   - Instant calculation of Net WPM (using the international standard 5-character word convention), Raw CPM, Accuracy %, and errors.
   - Automatic persistent save to SQLite with celebratory confetti on completion.

2. **Genuine Machine Learning Velocity Forecasting:**
   - Powered by **scikit-learn** Multiple Linear Regression.
   - Features engineered from real user practice records:
     - Sequential practice index (neuro-motor progression over time)
     - 3-session moving average (momentum modeling)
     - Typing accuracy ratio (precision influence)
     - Test duration normalization (endurance factor)
   - Visualizes actual historical data points alongside the fitted linear regression trend line and projected $N+1$ session speed.
   - Displays model determination coefficient ($R^2$), velocity slope ($m$), confidence level, and feature weights.
   - Calculates projected milestone targets (estimated sessions required to reach 50, 60, 70, 80, 100 WPM).
   - Safe bounds handling, transparent confidence disclaimer, and beginner-friendly mathematical explanations ($y = mx + b$).
   - Clear fallback state when fewer than 3 sessions exist, plus an optional **Demo Mode** toggle to test with realistic sample data immediately.

3. **Executive Analytics Dashboard:**
   - Dark-mode-first aesthetic inspired by professional developer tools (`#0B1020` Midnight Navy, `#22D3EE` Electric Cyan, `#8B5CF6` Vivid Violet).
   - 5 key metric cards: Total Practice Sessions, Latest WPM, All-Time Best WPM, Average Accuracy, and Predicted Next WPM.
   - Progress delta compared with the preceding session.
   - Typing speed progress line chart and accuracy consistency chart (Chart.js).
   - 7-day weekly activity bar chart and recent practice history table.

4. **Analytics & Historical Logs:**
   - Filterable historical session table by passage category and keyword search.
   - Speed vs accuracy dual-axis progression chart.
   - One-click CSV export of your entire practice history.
   - Session reset capability with confirmation safeguards.

5. **Personalized Goals:**
   - Customizable target WPM (20–160 WPM), target accuracy (80–100%), and daily practice minutes.
   - Visual progress gauges and live gap analysis (e.g. *"You are 4.5 WPM away from your goal"*).
   - Dynamic AI next-stretch recommendation.
   - Persistent goal synchronization in SQLite.

6. **Learn & Educational Hub:**
   - Transparent documentation on the 5-character WPM calculation convention.
   - Accuracy formulas and edge-case handling.
   - Deep dive into Linear Regression, feature engineering, and human typing plateaus.
   - Full technology stack documentation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Chart.js, react-chartjs-2, Lucide Icons, Canvas-Confetti |
| **Styling** | Vanilla CSS3, Custom CSS Variables, Glassmorphism, Responsive Grid/Flexbox |
| **Backend** | Python 3.12, Flask, Flask-CORS |
| **Machine Learning** | scikit-learn, pandas, NumPy |
| **Database** | SQLite 3 (`typetrend.db`) |
| **Architecture** | Decoupled Client-Server with RESTful JSON APIs |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or later (v20+ recommended) & `npm`
- **Python**: 3.10 or later

---

### Step 1: Start the Flask Backend

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the automated test suite to verify calculation and ML pipelines:
   ```bash
   python -m unittest test_backend.py -v
   ```

5. Start the Flask API server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://127.0.0.1:5000`.*

---

### Step 2: Start the React Frontend

1. Open a second terminal window in the project root:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 REST API Reference

All API routes communicate using JSON:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and database connectivity probe |
| `GET` | `/api/passages?category=general` | Retrieve typing passages filtered by category |
| `POST` | `/api/sessions` | Validate and persist completed typing session to SQLite |
| `GET` | `/api/sessions?category=...&limit=...` | Retrieve historical session records |
| `GET` | `/api/dashboard?include_demo=false` | Retrieve aggregate metrics, charts, and activity data |
| `GET` | `/api/prediction?include_demo=false` | Train scikit-learn Linear Regression and generate forecast |
| `GET` | `/api/goals` | Retrieve personalized target speed and accuracy goals |
| `PUT` | `/api/goals` | Update user goals with validation |
| `POST` | `/api/demo-data` | Seed realistic sample practice sessions tagged with `is_demo=1` |
| `POST` | `/api/clear-data` | Reset history (clears all or only demo sessions) |

---

## 🧮 Typing Calculation Standards

### 1. Words Per Minute (WPM)
Typing speed is standardized to normalize word length differences:
$$\text{Net WPM} = \frac{\text{Correct Characters} / 5.0}{\text{Elapsed Seconds} / 60.0}$$

### 2. Typing Accuracy
$$\text{Accuracy (\%)} = \left(\frac{\text{Correct Characters}}{\text{Total Typed Characters}}\right) \times 100$$
*(Safely falls back to 100% when 0 characters are typed).*

---

## 🤖 Machine Learning Model Architecture

The predictive engine uses **Multiple Linear Regression**:
$$y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \beta_3 x_3 + \beta_4 x_4 + \varepsilon$$

- **$x_1$:** Practice session index (1, 2, 3...)
- **$x_2$:** 3-session moving average WPM
- **$x_3$:** Accuracy factor (0.0 to 1.0)
- **$x_4$:** Normalized practice duration (minutes)

The model minimizes the residual sum of squares via Ordinary Least Squares (OLS) and computes $R^2$ to measure goodness-of-fit. When fewer than 3 sessions exist, TypeTrend gracefully provides a clearly-labeled baseline statistical fallback rather than an invalid projection.

---

## 🧪 Testing

Run backend unit and integration tests at any time:
```bash
cd backend
python -m unittest test_backend.py -v
```
Tests cover:
- Standard 5-character WPM calculation
- Accuracy calculation edge cases
- Payload schema and constraint validation
- Goals update restrictions
- End-to-end SQLite session persistence
- Linear Regression fitting and prediction response structure

---

## 💡 Troubleshooting

- **CORS or Network Connection Errors:**
  Ensure the Flask backend is running on `http://127.0.0.1:5000`. The Vite development configuration proxies `/api` directly to port 5000.
- **Port Conflict (5000 already in use):**
  Set the `PORT` environment variable before starting `app.py`:
  ```bash
  PORT=5001 python app.py
  ```
  And adjust `vite.config.js` proxy target accordingly.
- **Node.js version notice:**
  If using Node 20.11 or older, use `npm install` and `npm run dev` directly as configured in `frontend/package.json`.

---

## 📄 License
MIT License. Built for educational, portfolio, and typing mastery purposes.
