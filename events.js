// 公開可能な予定と受付設定のみ。
const scheduleSnapshot = {
  "events": [
    {
      "date": "2026-07-07",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-07-09",
      "name": "特別講座",
      "time": "19:00〜21:00",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-07-17",
      "name": "霊格アップお詣り",
      "time": "別途確認",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfYTDHHjZH56yWnauPkdWSTT-20OXrLs4ONQE8Z1mwtbvjHhg/viewform"
    },
    {
      "date": "2026-07-18",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-07-18",
      "name": "特別講座",
      "time": "14:30~16:30",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-07-28",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-08-04",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-08-22",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-08-22",
      "name": "特別講座",
      "time": "16:00〜18:00",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-08-25",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-08-28",
      "name": "実践会",
      "time": "10:00〜12:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-09-01",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-09-01",
      "name": "特別講座",
      "time": "19:00〜21:00",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-09-16",
      "name": "霊格アップお詣り",
      "time": "8:00〜20:00",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfYTDHHjZH56yWnauPkdWSTT-20OXrLs4ONQE8Z1mwtbvjHhg/viewform"
    },
    {
      "date": "2026-09-19",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-09-19",
      "name": "特別講座",
      "time": "14:30~16:30",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-09-22",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-10-01",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-10-06",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-10-06",
      "name": "特別講座",
      "time": "19:00〜21:00",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-10-10",
      "name": "実践会",
      "time": "10:00〜12:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-10-17",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-10-17",
      "name": "特別講座",
      "time": "14:30~16:30",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-10-20",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-11-03",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-11-04",
      "name": "特別講座",
      "time": "別途確認",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-11-14",
      "name": "特別講座",
      "time": "別途確認",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-11-18",
      "name": "霊格アップお詣り",
      "time": "別途確認",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSfYTDHHjZH56yWnauPkdWSTT-20OXrLs4ONQE8Z1mwtbvjHhg/viewform"
    },
    {
      "date": "2026-11-21",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-11-24",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-12-01",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-12-18",
      "name": "実践会",
      "time": "10:00〜12:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-12-19",
      "name": "シェア会",
      "time": "10:00〜13:00",
      "registration": "出欠回答",
      "formUrl": ""
    },
    {
      "date": "2026-12-19",
      "name": "特別講座",
      "time": "別途確認",
      "registration": "別途フォーム",
      "formUrl": "https://docs.google.com/forms/d/e/1FAIpQLSe0S_bFdvEE3sUx27NyLGoytQrIkouLc9bi2GyT23T5KnkrqA/viewform"
    },
    {
      "date": "2026-12-22",
      "name": "アドバンスコース",
      "time": "20:00〜22:00",
      "registration": "出欠回答",
      "formUrl": ""
    }
  ]
};
