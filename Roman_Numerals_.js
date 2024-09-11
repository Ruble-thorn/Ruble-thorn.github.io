/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = {};


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzNjEiIGhlaWdodD0iMzYxIiB2aWV3Qm94PSIwLDAsMzYxLDM2MSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTU5LjUsMC41KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNNTkuNSwzNjAuNXYtMzYxaDM2MXYzNjF6IiBmaWxsPSIjYmZhNjdiIiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik03OC4wNzE0NywxMzcuODY2MTdsMjguMTI5MDUsLTIuMjA5MDZsMC41MDUzOCw1Ljk3NjVsLTguMTY4NDgsMy42NTc5N2w0LjU0MjUxLDU0LjcyMTU5bDguNjM3OSwxLjkxNjI1bDAuMzg4OSw2LjExMzI5bC0yNy43MjY0NCwyLjIxNjUybC0wLjUxNjA0LC02LjEwMjU0bDguMjkyMzcsLTMuMzkwMTZsLTQuNzQ2MzYsLTU0LjYxNTQ0bC04Ljg4MTc4LC0yLjA2NTk0eiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTEyMi4xNzMwNiwxOTYuMDA4MjJsMS4yNzI1MywwLjMxMDgzYzAsMCA0LjkxNjQ5LDguOTIyNDQgNi43NTEzNywxMi45NTgyM2MxLjYwNzY3LDMuNTM2MDYgMy42NjY2MSw5Ljk1NjA4IDMuNjY2NjEsOS45NTYwOGwtNS4zNDc1Miw1LjQ4NjEzYzAsMCAtNC44OTIyNywtNy45Nzk1OSAtNy4zNjI3MiwtMTEuNjE3MzZjLTIuMjQwOTcsLTMuMjk5ODMgLTYuNjk2MDYsLTkuMzQyODQgLTYuNjk2MDYsLTkuMzQyODR6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMTc2LjQ1NjM2LDEzNS4wMTM1NmwyNy45NDY3MywzLjg4NjM0bC0wLjc5MDU0LDUuOTQ1NTFsLTguNzYzNjUsMS44MTc0NWwtNy4zMjEwNSw1NC40MTk1N2w4LjAyNDQzLDMuNzI3NDNsLTAuOTMzNjgsNi4wNTQwOGwtMjcuNTU1MTQsLTMuNzkyNTVsMC44MDcyMSwtNi4wNzA4OWw4LjgyNzExLC0xLjUyOTI5bDcuMDk5MTYsLTU0LjM1OTdsLTguMjMwNDUsLTMuOTI2MDN6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjA3LjU0MjEyLDEzNi43NTQ0NGwyOC4yMTUxNiwwLjE2ODk1djUuOTk3ODNsLTguNDQ3NjUsMi45NTY2OGwtMC4wODQ0OCw1NC45MDk3NGw4LjQ0NTcyLDIuNjM3MjZsLTAuMTI3NTksNi4xMjQzMmwtMjcuODE0NjEsLTAuMTI3NTl2LTYuMTI0MzJsOC41NDg1MywtMi42NzkzOWwtMC4xMjc1OSwtNTQuODIxMTVsLTguNjc2MTIsLTIuODA2OTh6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzA5LjU4NTkzLDEzNC4yNTI4MmwyNi45MDMzOSw4LjUwNDc5bC0xLjc3MzYsNS43Mjk2bC04Ljk0NDE3LDAuMzI2NDNsLTE2LjMxNzg1LDUyLjQyOTE0bDcuMjg4MTYsNS4wMTY3N2wtMS45MzI4OCw1LjgxMjdsLTI2LjUzMjk4LC04LjM0NjgzbDEuODExLC01Ljg1MDQzbDguOTU4NTQsLTAuMDMxNzFsMTYuMDg5MDcsLTUyLjQwNzIybC03LjQ1ODA3LC01LjI0NzAzeiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMzNC4wNDIwOSw3MC4yMjYyNmwyOC4yMTUxNiwwLjE2ODk1djUuOTk3ODNsLTguNDQ3NjUsMi45NTY2OGwtMC4wODQ0OCw1NC45MDk3NGw4LjQ0NTcyLDIuNjM3MjZsLTAuMTI3NTksNi4xMjQzMmwtMjcuODE0NjEsLTAuMTI3NTl2LTYuMTI0MzJsOC41NDg1MywtMi42NzkzOWwtMC4xMjc1OSwtNTQuODIxMTVsLTguNjc2MTIsLTIuODA2OTh6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMzU5LjAzMzI1LDE0My42MTM5MWwyNi41OTg3NCwtOS40MTQ0bDIuMDM1MDUsNS42NDIwM2wtNi45NDMzMyw1LjY0NzU1bDE4LjU1MTI2LDUxLjY4MTExbDguODM5NTMsLTAuMzg0OGwxLjk1Nzk0LDUuODA0MzFsLTI2LjIwNzkxLDkuMzE3NGwtMi4wNzc5NywtNS43NjEwMmw3LjEzMjMxLC01LjQyMDk0bC0xOC43MjA3LC01MS41MjU4MmwtOS4xMTM4NSwwLjMwMzMyeiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTIzOC4wNjYxOCwyMTMuMzY1MTVsMC4zMjM0LC0xLjI2OTRjMCwwIDguOTcwNjMsLTQuODI4MDIgMTMuMDI0MzYsLTYuNjIyODljMy41NTE3OCwtMS41NzI2MiA5Ljk5MTg2LC0zLjU2Nzk3IDkuOTkxODYsLTMuNTY3OTdsNS40MzI5Nyw1LjQwMTUxYzAsMCAtOC4wMjc1OCw0LjgxMzEyIC0xMS42ODk2LDcuMjQ3NDhjLTMuMzIxODMsMi4yMDgyMiAtOS40MDg2MSw2LjYwMzMzIC05LjQwODYxLDYuNjAzMzN6IiBmaWxsPSIjMDAwMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjoxODAuNToxODAuNS0tPg==",
                "id": "Romannumerals",
                "name": "Roman Numerals ",
                "docsURI": "https://en.wikipedia.org/wiki/Roman_numerals",
                "color1": "#b99e7e",
                "color2": "#7b6547",
                "color3": "#a57712",
                "tbShow": true,
                "blocks": blocks,
                "menus": menus
            }
        }
    }
    blocks.push({
        opcode: "Roman1",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅰ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman1"] = async (args, util) => {
        return 1
    };

    blocks.push({
        opcode: "Roman2",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅱ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman2"] = async (args, util) => {
        return 2
    };

    blocks.push({
        opcode: "Roman3",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅲ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman3"] = async (args, util) => {
        return 3
    };

    blocks.push({
        opcode: "Roman4",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅳ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman4"] = async (args, util) => {
        return 4
    };

    blocks.push({
        opcode: "Roman5",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅴ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman5"] = async (args, util) => {
        return 5
    };

    blocks.push({
        opcode: "Roman6",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅵ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman6"] = async (args, util) => {
        return 6
    };

    blocks.push({
        opcode: "Roman7",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅶ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman7"] = async (args, util) => {
        return 7
    };

    blocks.push({
        opcode: "Roman8",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅷ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman8"] = async (args, util) => {
        return 8
    };

    blocks.push({
        opcode: "Roman9",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅸ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman9"] = async (args, util) => {
        return 9
    };

    blocks.push({
        opcode: "Roman10",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅹ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman10"] = async (args, util) => {
        return 10
    };

    blocks.push({
        opcode: "Roman20",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅩⅩ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman20"] = async (args, util) => {
        return 20
    };

    blocks.push({
        opcode: "Roman30",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅩⅩⅩ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman30"] = async (args, util) => {
        return 30
    };

    blocks.push({
        opcode: "Roman40",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅩⅬ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman40"] = async (args, util) => {
        return 40
    };

    blocks.push({
        opcode: "Roman50",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅼ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman50"] = async (args, util) => {
        return 50
    };

    blocks.push({
        opcode: "Roman60",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅬⅩ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman60"] = async (args, util) => {
        return 60
    };

    blocks.push({
        opcode: "Roman70",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅬⅩⅩ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman70"] = async (args, util) => {
        return 70
    };

    blocks.push({
        opcode: "Roman80",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅬⅩⅩⅩ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman80"] = async (args, util) => {
        return 80
    };

    blocks.push({
        opcode: "Roman90",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅩⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman90"] = async (args, util) => {
        return 90
    };

    blocks.push({
        opcode: "Roman100",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅽ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman100"] = async (args, util) => {
        return 100
    };

    blocks.push({
        opcode: "Roman200",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅭⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman200"] = async (args, util) => {
        return 200
    };

    blocks.push({
        opcode: "Roman300",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅭⅭⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman300"] = async (args, util) => {
        return 300
    };

    blocks.push({
        opcode: "Roman400",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅭⅮ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman400"] = async (args, util) => {
        return 400
    };

    blocks.push({
        opcode: "Roman500",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅾ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman500"] = async (args, util) => {
        return 500
    };

    blocks.push({
        opcode: "Roman600",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅮⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman600"] = async (args, util) => {
        return 600
    };

    blocks.push({
        opcode: "Roman700",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅮⅭⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman700"] = async (args, util) => {
        return 700
    };

    blocks.push({
        opcode: "Roman800",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅮⅭⅭⅭ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman800"] = async (args, util) => {
        return 800
    };

    blocks.push({
        opcode: "Roman900",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅭⅯ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman900"] = async (args, util) => {
        return 900
    };

    blocks.push({
        opcode: "Roman1000",
        blockType: Scratch.BlockType.REPORTER,
        text: "Ⅿ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman1000"] = async (args, util) => {
        return 1000
    };

    blocks.push({
        opcode: "Roman2000",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅯⅯ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman2000"] = async (args, util) => {
        return 2000
    };

    blocks.push({
        opcode: "Roman3000",
        blockType: Scratch.BlockType.REPORTER,
        text: "ⅯⅯⅯ",
        arguments: {},
        disableMonitor: true,
        isEdgeActivated: false
    });
    Extension.prototype["Roman3000"] = async (args, util) => {
        return 3000
    };

    Scratch.extensions.register(new Extension());
})(Scratch);
