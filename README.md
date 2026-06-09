# Afforda 

Afforda is a Flutter-based personal finance application that helps users make smarter purchasing decisions by converting the cost of a purchase into the amount of work time required to earn it.

Instead of asking *"Can I afford this?"*, Afforda helps users ask *"Is this worth the time I worked for it?"*

---

## Features

### Work-Time Cost Calculator

Convert any purchase price into:

* Hours of work
* Days of work
* Real earning effort

### Smart Purchase Evaluation

Afforda categorizes purchases into:

* ✅ Safe
* 🤔 Think
* ⚠️ Risky

based on the user's income and work schedule.

### 📊 Personalized Financial Insights

* Monthly income tracking
* Custom working days and hours
* Savings-aware calculations
* Real-time purchase evaluation

### Instant Results

Calculations update instantly as users type, providing immediate feedback without delays.

### Offline Data Storage

User preferences and financial profile are securely stored on the device using Hive.

### Modern User Experience

* Clean and minimal interface
* Responsive design
* Smooth animations
* Professional color system
* Intuitive navigation

---

##  Screens

### Onboarding

Set up:

* Monthly income
* Working days per week
* Working hours per day
* Savings information

### Calculator

Evaluate purchases in real time and receive instant recommendations.

### Settings

Manage and update financial information whenever needed.

---

##  Tech Stack

### Frontend for app version

* Flutter
* Dart

### Frontend for web version
* HTML, CSS and JS

### State Management

* Riverpod

### Local Database

* Hive

### UI & Design

* Google Fonts
* Flutter Animate

### Utilities

* Intl

---

## 📂 Project Structure for app version

```text
lib/
├── core/
│   ├── providers/
│   ├── services/
│   └── theme/
│
├── features/
│   ├── calculator/
│   ├── setup/
│   └── settings/
│
├── models/
│
├── shared/
│   └── widgets/
│
└── main.dart
```

---
---

## 📂 Project Structure for web version

```text
lib/
├── CSS/
│
├── JS/
│
├── HTML/
```

---

## 🧮 Calculation Logic

Hourly earning rate:

```text
Hourly Rate =
Monthly Income ÷
(Working Days × Working Hours × 4.33)
```

Savings support:

```text
Usable Savings =
min(Total Savings × 30%, Total Savings)
```

Purchase effort:

```text
Required Work Hours =
Amount To Earn ÷ Hourly Rate
```

Decision levels:

```text
0–4 Hours      → Safe
4–12 Hours     → Think
12+ Hours      → Risky
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/yourusername/afforda.git
```

### Install Dependencies

```bash
flutter pub get
```

### Run Application

```bash
flutter run
```

### Build Release APK

```bash
flutter build apk --release
```

---

## Why Afforda?

Many people evaluate purchases only by price.

Afforda introduces a different perspective:

> Every purchase costs money, but every dollar also costs time.

By translating spending decisions into work hours, Afforda helps users better understand the real impact of their purchases and make more intentional financial choices.

---

## 🔮 Future Roadmap

* Spending history
* Savings goals
* Budget tracking
* Expense categories
* Dark mode
* Multiple currencies
* Analytics dashboard
* AI-powered spending insights
* Cloud backup

---

## Contributing

Contributions, issues, and feature requests are welcome.

Feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---

Built with ❤️ using Flutter for app and HTML CSS AND JS For WEB.
