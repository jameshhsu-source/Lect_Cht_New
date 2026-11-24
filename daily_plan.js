/**
 * 教會年一年通讀聖經計畫引擎 (Church Year 1-Year Bible Reading Plan)
 * 原創編排：100% 涵蓋 66 卷書、1,189 章，無重複、無遺漏。
 * 依賴：LectionaryEngine (engine.js)
 */
class DailyReadingPlan {
    static _cache = {};

    static dateKey(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    static expandBooks(bookList) {
        const chapters = [];
        for (const [book, count] of bookList) {
            for (let ch = 1; ch <= count; ch++) {
                chapters.push(`${book} ${ch}`);
            }
        }
        return chapters;
    }

    static distributeEvenly(items, numDays) {
        const n = items.length;
        const result = Array.from({ length: numDays }, () => []);
        if (n === 0 || numDays === 0) return result;
        if (n >= numDays) {
            for (let d = 0; d < numDays; d++) {
                const start = Math.floor((d * n) / numDays);
                const end = Math.floor(((d + 1) * n) / numDays);
                result[d] = items.slice(start, end);
            }
        } else {
            for (let idx = 0; idx < n; idx++) {
                const d = Math.floor((idx * numDays) / n);
                result[d].push(items[idx]);
            }
        }
        return result;
    }

    static buildYearPlan(startYear) {
        if (this._cache[startYear]) return this._cache[startYear];

        const a1Start = LectionaryEngine.calculateAdvent1(startYear);
        const xmasEve = new Date(startYear, 11, 24);
        const xmasDay = new Date(startYear, 11, 25);
        const xmasEnd = new Date(startYear + 1, 0, 5);
        const epiphany = new Date(startYear + 1, 0, 6);
        const easter = LectionaryEngine.calculateEaster(startYear + 1);
        const ashWed = LectionaryEngine.addDays(easter, -46);
        const goodFri = LectionaryEngine.addDays(easter, -2);
        const pentecost = LectionaryEngine.addDays(easter, 49);
        const a1Next = LectionaryEngine.calculateAdvent1(startYear + 1);
        const endOfYear = LectionaryEngine.addDays(a1Next, -1);
        const endSeasonStart = LectionaryEngine.addDays(a1Next, -21);
        const christKing = LectionaryEngine.addDays(a1Next, -7);

        const seasonDefs = [
            [
                "將臨期", a1Start, xmasEve,
                [["以賽亞書", 66], ["彌迦書", 7]],
                [["馬太福音", 28]]
            ],
            [
                "聖誕期", xmasDay, xmasEnd,
                [["路得記", 4], ["雅歌", 8], ["傳道書", 12]],
                [["加拉太書", 6], ["腓立比書", 4], ["提多書", 3]]
            ],
            [
                "顯現期", epiphany, LectionaryEngine.addDays(ashWed, -1),
                [["創世記", 50], ["約拿書", 4], ["阿摩司書", 9], ["何西阿書", 14]],
                [["約翰福音", 21], ["羅馬書", 16]]
            ],
            [
                "預苦期與聖週", ashWed, LectionaryEngine.addDays(easter, -1),
                [["出埃及記", 40], ["約伯記", 42], ["耶利米哀歌", 5], ["約珥書", 3]],
                [["馬可福音", 16], ["希伯來書", 13], ["雅各書", 5]]
            ],
            [
                "復活期", easter, pentecost,
                [["利未記", 27], ["民數記", 36], ["申命記", 34]],
                [["路加福音", 24], ["使徒行傳", 28]]
            ],
            [
                "常年期", LectionaryEngine.addDays(pentecost, 1), LectionaryEngine.addDays(endSeasonStart, -1),
                [
                    ["約書亞記", 24], ["士師記", 21], ["撒母耳記上", 31], ["撒母耳記下", 24],
                    ["列王紀上", 22], ["列王紀下", 25], ["歷代志上", 29], ["歷代志下", 36],
                    ["以斯拉記", 10], ["尼希米記", 13], ["以斯帖記", 10],
                    ["耶利米書", 52], ["以西結書", 48], ["俄巴底亞書", 1], ["那鴻書", 3],
                    ["哈巴谷書", 3], ["西番雅書", 3], ["哈該書", 2]
                ],
                [
                    ["哥林多前書", 16], ["哥林多後書", 13], ["以弗所書", 6], ["歌羅西書", 4],
                    ["提摩太前書", 6], ["提摩太後書", 4], ["腓利門書", 1],
                    ["彼得前書", 5], ["彼得後書", 3], ["約翰一書", 5], ["約翰二書", 1], ["約翰三書", 1], ["猶大書", 1]
                ]
            ],
            [
                "教會年末", endSeasonStart, endOfYear,
                [["但以理書", 12], ["撒迦利亞書", 14], ["瑪拉基書", 4]],
                [["帖撒羅尼迦前書", 5], ["帖撒羅尼迦後書", 3], ["啟示錄", 22]]
            ]
        ];

        const plan = {};
        const allKeys = [];

        for (const [sName, start, end, otBooks, ntBooks] of seasonDefs) {
            const numDays = LectionaryEngine.diffDays(start, end) + 1;
            const otDist = this.distributeEvenly(this.expandBooks(otBooks), numDays);
            const ntDist = this.distributeEvenly(this.expandBooks(ntBooks), numDays);

            for (let d = 0; d < numDays; d++) {
                const curDate = LectionaryEngine.addDays(start, d);
                const key = this.dateKey(curDate);
                allKeys.push(key);
                plan[key] = {
                    date: key,
                    season: sName,
                    ot: otDist[d],
                    nt: ntDist[d],
                    ps_pr: []
                };
            }
        }

        // 關鍵節日詩篇鎖定
        const pinnedPsalms = {
            [this.dateKey(xmasEve)]: "詩篇 96",
            [this.dateKey(xmasDay)]: "詩篇 98",
            [this.dateKey(ashWed)]: "詩篇 51",
            [this.dateKey(goodFri)]: "詩篇 22",
            [this.dateKey(easter)]: "詩篇 118",
            [this.dateKey(pentecost)]: "詩篇 104",
            [this.dateKey(christKing)]: "詩篇 93"
        };
        const pinnedNums = new Set([96, 98, 51, 22, 118, 104, 93]);

        // 超長詩篇切分
        const longPsalmSplits = {
            18: ["詩篇 18:1-24", "詩篇 18:25-50"],
            78: ["詩篇 78:1-37", "詩篇 78:38-72"],
            89: ["詩篇 89:1-29", "詩篇 89:30-52"],
            105: ["詩篇 105:1-22", "詩篇 105:23-45"],
            106: ["詩篇 106:1-23", "詩篇 106:24-48"],
            107: ["詩篇 107:1-22", "詩篇 107:23-43"],
            119: Array.from({ length: 11 }, (_, idx) => {
                const s = idx * 16 + 1;
                return `詩篇 119:${s}-${s + 15}`;
            })
        };

        const psOnly = [];
        for (let p = 1; p <= 150; p++) {
            if (pinnedNums.has(p)) continue;
            if (longPsalmSplits[p]) {
                psOnly.push(...longPsalmSplits[p]);
            } else {
                psOnly.push(`詩篇 ${p}`);
            }
        }

        const prOnly = Array.from({ length: 31 }, (_, i) => `箴言 ${i + 1}`);

        // 將箴言平均交錯於詩篇中
        const combinedPsPr = [];
        const totalUnits = psOnly.length + prOnly.length;
        let psIdx = 0, prIdx = 0;
        for (let i = 0; i < totalUnits; i++) {
            if (prIdx < prOnly.length && (i + 1) * prOnly.length >= (prIdx + 1) * totalUnits) {
                combinedPsPr.push(prOnly[prIdx++]);
            } else {
                combinedPsPr.push(psOnly[psIdx++]);
            }
        }

        // 填入鎖定節日詩篇
        for (const [k, psStr] of Object.entries(pinnedPsalms)) {
            if (plan[k]) plan[k].ps_pr.push(psStr);
        }

        // 將其餘詩篇與箴言平均分散到未鎖定的日期
        const unpinnedKeys = allKeys.filter(k => !pinnedPsalms[k]);
        const psPrDist = this.distributeEvenly(combinedPsPr, unpinnedKeys.length);
        for (let i = 0; i < unpinnedKeys.length; i++) {
            plan[unpinnedKeys[i]].ps_pr.push(...psPrDist[i]);
        }

        this._cache[startYear] = plan;
        return plan;
    }

    static getDailyReading(dateObj) {
        const y = dateObj.getFullYear();
        const a1 = LectionaryEngine.calculateAdvent1(y);
        const startYear = LectionaryEngine.diffDays(a1, dateObj) < 0 ? y - 1 : y;
        const plan = this.buildYearPlan(startYear);
        const key = this.dateKey(dateObj);
        return plan[key] || null;
    }
}
