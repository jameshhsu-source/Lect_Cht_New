
class LectionaryEngine {
    static addDays(dateObj, days) {
        let d = new Date(dateObj.valueOf());
        d.setDate(d.getDate() + days);
        return d;
    }

    static isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getDate() === d2.getDate();
    }

    static diffDays(d1, d2) {
        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
        return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
    }

    static calculateEaster(year) {
        const a = year % 19, b = Math.floor(year / 100), c = year % 100;
        const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day);
    }

    static calculateAdvent1(year) {
        for (let day = 27; day <= 33; day++) {
            const d = new Date(year, day <= 30 ? 10 : 11, day <= 30 ? day : day - 30);
            if (d.getDay() === 0) return d;
        }
    }

    static getAnchors(year) {
        const easter = this.calculateEaster(year);
        const advent1 = this.calculateAdvent1(year);
        return {
            easter: easter,
            advent1: advent1,
            epiphany: new Date(year, 0, 6),
            ash_wednesday: this.addDays(easter, -46),
            palm_sunday: this.addDays(easter, -7),
            ascension: this.addDays(easter, 39),
            pentecost: this.addDays(easter, 49),
            trinity: this.addDays(easter, 56),
            christ_the_king: this.addDays(advent1, -7)
        };
    }

    static getCycle(dt) {
        const advent1 = this.calculateAdvent1(dt.getFullYear());
        const litYear = dt < advent1 ? dt.getFullYear() - 1 : dt.getFullYear();
        return ["A", "B", "C"][(litYear - 2025 + 300) % 3]; 
    }

    static getLiturgicalColor(season, sunday) {
        if (season === "Advent") return "藍色";
        if (season === "Christmas") return "白色";
        if (season === "Epiphany") {
            if (["Epiphany", "First Sunday", "Transfiguration", "Presentation"].includes(sunday)) return "白色";
            return "綠色";
        }
        if (["Lent", "Holy Week"].includes(season)) {
            if (["Palm Sunday", "Maundy Thursday"].includes(sunday)) return "紅色";
            if (["Good Friday", "Holy Saturday"].includes(sunday)) return "黑色";
            if (sunday === "Annunciation") return "白色";
            return "紫色";
        }
        if (season === "Easter") return "白色";
        if (["Pentecost", "Ordinary Time"].includes(season)) {
            if (["Pentecost Sunday", "Holy Cross"].includes(sunday)) return "紅色";
            if (["Trinity Sunday", "Christ the King", "All Saints"].includes(sunday)) return "白色";
            return "綠色";
        }
        return "";
    }

    static processScriptureLinks(text) {
        return text.replace(/([一-龥]+)\s*(\d+)(?::([\d\-a-z, \(\)]+))?/g, (match, book, chapter, verses) => {
            const target = LectionaryData.sigao_book_map[book];
            if (target) {
                const platform = target[0];
                const code = target[1];
                if (platform === "wdb") {
                    let url = `https://wdbible.com/tw/bible/${code}.${chapter}.cunpt`;
                    if (verses) {
                        const vMatch = verses.match(/\d+(?:-\d+)?/);
                        if (vMatch) url += `#${vMatch[0]}`;
                    }
                    return `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='inherit'">${match}</a>`;
                } else if (platform === "sigao") {
                    let url = `https://www.ccreadbible.org/chinesebible/sigao/${code}_bible_Ch_${chapter}_.html`;
                    return `<a href="${url}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='inherit'">${match}</a> <span style="font-size: 0.85em; color: #64748b;">(次經)</span>`;
                }
            }
            return match;
        });
    }

    static identifyDay(dt) {
        const anchors = this.getAnchors(dt.getFullYear());
        const zh_ords = ["第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八", "第九", "第十"];
        const ords = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth"];
        const arabic_to_zh = {"1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "10": "十", "11": "十一", "12": "十二", "13": "十三", "14": "十四", "15": "十五", "16": "十六", "17": "十七", "18": "十八", "19": "十九", "20": "二十", "21": "二十一", "22": "二十二", "23": "二十三", "24": "二十四", "25": "二十五", "26": "二十六", "27": "二十七", "28": "二十八", "29": "二十九", "30": "三十", "31": "三十一", "32": "三十二", "33": "三十三", "34": "三十四"};
        let events = [];

        const m = dt.getMonth() + 1;
        const d = dt.getDate();

        // 1. 固定節日
        if (m===12 && d===24) events.push(["Christmas", "Christmas Eve", "平安夜"]);
        if (m===12 && d===25) events.push(["Christmas", "Christmas Day", "聖誕節"]);
        if (m===1 && d===1) events.push(["Christmas", "New Year", "新年"]);
        if (this.isSameDay(dt, anchors.epiphany)) events.push(["Epiphany", "Epiphany", "主顯日"]);
        if (m===2 && d===2) events.push(["Epiphany", "Presentation", "主奉獻日"]);
        if (m===3 && d===25) events.push(["Lent", "Annunciation", "天使報喜日"]);
        if (m===5 && d===31) events.push(["Easter", "Visitation", "馬利亞探望伊利沙伯"]);
        if (m===9 && d===14) events.push(["Ordinary Time", "Holy Cross", "聖十字架日"]);
        if (m===10 && d===31) events.push(["Ordinary Time", "Reformation", "宗教改革日"]);
        if (m===11 && d===1) events.push(["Ordinary Time", "All Saints", "諸聖日"]);

        // 感恩節 (計算)
        const getThanksgiving = (yr) => {
            let tmp = new Date(yr, 10, 1);
            while(tmp.getDay() !== 4) tmp = this.addDays(tmp, 1);
            return this.addDays(tmp, 21);
        };
        const getCanadianThanksgiving = (yr) => {
            let tmp = new Date(yr, 9, 1);
            while(tmp.getDay() !== 1) tmp = this.addDays(tmp, 1);
            return this.addDays(tmp, 7);
        };
        if (this.isSameDay(dt, getThanksgiving(dt.getFullYear()))) events.push(["Ordinary Time", "Thanksgiving", "感恩節"]);
        if (this.isSameDay(dt, getCanadianThanksgiving(dt.getFullYear()))) events.push(["Ordinary Time", "Canadian Thanksgiving Day", "加拿大感恩節"]);

        // 2. 復活節相關浮動節日
        if (this.isSameDay(dt, anchors.ash_wednesday)) events.push(["Lent", "Ash Wednesday", "聖灰日"]);
        if (this.isSameDay(dt, anchors.palm_sunday)) events.push(["Holy Week", "Palm Sunday", "棕枝主日"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -6))) events.push(["Holy Week", "Monday of Holy Week", "聖週一"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -5))) events.push(["Holy Week", "Tuesday of Holy Week", "聖週二"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -4))) events.push(["Holy Week", "Wednesday of Holy Week", "聖週三"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -3))) events.push(["Holy Week", "Maundy Thursday", "主立聖餐日"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -2))) events.push(["Holy Week", "Good Friday", "受難日"]);
        if (this.isSameDay(dt, this.addDays(anchors.easter, -1))) events.push(["Holy Week", "Holy Saturday", "聖週六"]);
        if (this.isSameDay(dt, anchors.ascension)) events.push(["Easter", "Ascension", "基督升天日"]);
        if (this.isSameDay(dt, anchors.easter)) events.push(["Easter", "Easter Evening", "復活節黃昏"]);

        // 3. 週日判定
        if (dt.getDay() !== 0) return events.length > 0 ? events : null;

        if (this.isSameDay(dt, anchors.easter)) events.push(["Easter", "Easter Sunday", "復活節"]);
        else if (this.isSameDay(dt, anchors.pentecost)) events.push(["Pentecost", "Pentecost Sunday", "聖靈降臨主日"]);
        else if (this.isSameDay(dt, anchors.trinity)) events.push(["Ordinary Time", "Trinity Sunday", "三一主日"]);
        else if (this.isSameDay(dt, anchors.christ_the_king)) events.push(["Ordinary Time", "Christ the King", "基督君王主日"]);
        
        else if (dt >= anchors.advent1 && dt <= this.addDays(anchors.advent1, 21)) {
            const idx = Math.floor(this.diffDays(anchors.advent1, dt) / 7);
            events.push(["Advent", `${ords[idx]} Sunday`, `將臨期${zh_ords[idx]}主日`]);
        } 
        else {
            const prev_xmas = m === 1 ? new Date(dt.getFullYear() - 1, 11, 25) : new Date(dt.getFullYear(), 11, 25);
            if ((dt > prev_xmas && dt < anchors.epiphany) || (dt > new Date(dt.getFullYear(), 11, 25) && dt <= new Date(dt.getFullYear(), 11, 31))) {
                const idx = Math.floor(this.diffDays(prev_xmas, dt) / 7);
                events.push(["Christmas", `${ords[idx]} Sunday`, `聖誕期${zh_ords[idx]}主日`]);
            }
            else if (dt > anchors.epiphany && dt < anchors.ash_wednesday) {
                if (this.addDays(dt, 7) >= anchors.ash_wednesday) {
                    events.push(["Epiphany", "Transfiguration", "登山變像主日"]);
                } else {
                    const epDay = anchors.epiphany.getDay();
                    const base_sun = this.addDays(anchors.epiphany, epDay !== 0 ? (7 - epDay) : 7);
                    const idx = Math.floor(this.diffDays(base_sun, dt) / 7);
                    if (idx === 0) events.push(["Epiphany", "First Sunday", "耶穌受洗主日"]);
                    else events.push(["Epiphany", `${ords[idx]} Sunday`, `顯現後${zh_ords[idx]}主日`]);
                }
            }
            else if (dt > anchors.ash_wednesday && dt < anchors.palm_sunday) {
                const base_sun = this.addDays(anchors.ash_wednesday, 7 - anchors.ash_wednesday.getDay());
                const idx = Math.floor(this.diffDays(base_sun, dt) / 7);
                events.push(["Lent", `${ords[idx]} Sunday`, `預苦期${zh_ords[idx]}主日`]);
            }
            else if (dt > anchors.easter && dt < anchors.pentecost) {
                const idx = Math.floor(this.diffDays(anchors.easter, dt) / 7);
                events.push(["Easter", `${ords[idx]} Sunday`, `復活期${zh_ords[idx]}主日`]);
            }
            else if (dt > anchors.trinity && dt < anchors.christ_the_king) {
                const weeks_before_advent = Math.floor(this.diffDays(dt, anchors.advent1) / 7);
                const proper_num = 30 - weeks_before_advent;
                if (proper_num > 0) {
                    const zhNum = arabic_to_zh[proper_num.toString()] || proper_num.toString();
                    events.push(["Ordinary Time", `Proper ${proper_num}`, `常年期第${zhNum}組經課`]);
                }
            }
        }

        const unique = [];
        const seen = new Set();
        events.forEach(e => {
            const key = e.join("|");
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(e);
            }
        });
        unique.sort((a, b) => (a[1].includes("Evening") ? 1 : 0) - (b[1].includes("Evening") ? 1 : 0));
        return unique.length > 0 ? unique : null;
    }

    static getLectionary(dateObj) {
        const eventsInfo = this.identifyDay(dateObj);
        if (!eventsInfo) return null;

        const cycle = this.getCycle(dateObj);
        const cycleZhMap = {"A": "甲年", "B": "乙年", "C": "丙年"};
        
        let results = [];
        eventsInfo.forEach(evt => {
            const season = evt[0], sunday = evt[1], rawName = evt[2];
            const lookupSunday = sunday === "Canadian Thanksgiving Day" ? "Thanksgiving" : sunday;
            
            const cycleScriptures = LectionaryData.scripture_patch[cycle] || {};
            const scriptures = cycleScriptures[`${season}|${lookupSunday}`] || [];
            
            const isSpecial = ["Thanksgiving", "Holy Cross", "Reformation", "All Saints"].includes(lookupSunday);
            if (scriptures.length === 0 && !isSpecial) return;

            let structScriptures = { general: [], track_semi_continuous: [], track_complementary: [] };
            let currTrack = "general";
            
            scriptures.forEach(s => {
                if (!s) return;
                if (s.includes("【半連續式】")) { currTrack = "track_semi_continuous"; return; }
                if (s.includes("【呼應式】")) { currTrack = "track_complementary"; return; }
                let clean = s.replace(/<div[^>]*>/g, '').replace('</div>', '');
                if (/\d/.test(clean) && !clean.startsWith("【")) {
                    clean = this.processScriptureLinks(clean);
                }
                structScriptures[currTrack].push(clean);
            });

            if (lookupSunday === "Thanksgiving") {
                structScriptures.general.push("太18:18 我實在告訴你們，凡你們在地上所捆綁的，在天上也要捆綁；凡你們在地上所釋放的，在天上也要釋放。");
            }

            const wrapYtLink = (h) => {
                const searchKw = encodeURIComponent(h.replace(/：/g, " "));
                const ytUrl = `https://www.youtube.com/results?search_query=${searchKw}`;
                return `<a href="${ytUrl}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='inherit'">${h}</a>`;
            };

            let cHymns = [];
            const yearDict = LectionaryData.classical_hymns_map[`${season}|${lookupSunday}`];
            if (yearDict) {
                let rawC = (yearDict[cycle] || []).concat(yearDict["All"] || []);
                rawC = [...new Set(rawC)];
                cHymns = rawC.map(h => wrapYtLink(h));
            }

            let rawM = LectionaryData.hymn_map[`${season}|${lookupSunday}`];
            if (!rawM) rawM = LectionaryData.hymn_map[`${season}|None`] || [];
            let mHymns = rawM.map(h => wrapYtLink(h));

            results.push({
                date: dateObj.toISOString().split('T')[0],
                title: `${rawName} (${cycleZhMap[cycle] || ""})`,
                scriptures: structScriptures,
                classical_hymns: cHymns,
                modern_hymns: mHymns,
                color: this.getLiturgicalColor(season, lookupSunday),
                meaning: LectionaryData.season_meaning_map[season] || "",
                season: season,
                is_evening: sunday.includes("Evening")
            });
        });

        return results.length > 0 ? results : null;
    }
}
