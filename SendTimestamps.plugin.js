/**
 * @name SendTimestamps
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.0.2
 * @description Use Discord's latest feature of using timestamps in your messages easily.
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {
        info: {
            name: "Send Timestamps",
            authors: [
                {
                    name: "Taimoor",
                    discord_id: "220161488516546561",
                    github_username: "Taimoor-Tariq",
                },
            ],
            version: "1.0.2",
            description:
                "Use Discord's latest feature of using timestamps in your messages easily.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
            github_raw:
                "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
        },
        changelog: [
            {
                title: "Improvements",
                type: "improved",
                items: ["**Button**: Fixed sizing issues"],
            },
            {
                title: "On-going",
                type: "progress",
                items: [
                    "**Console Errors**: Working on fixing the console errors",
                ],
            },
        ],
        main: "index.js",
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
    const
        css = `.attachWrapper-2TRKBi {	display: flex; flex-direction: row; }
.attachButton-2WznTc { padding: 10px; }

.timestamp-button { color: var(--interactive-normal); }
.timestamp-button:hover { color: var(--interactive-hover); }
.timestamp-button button { min-height: 32px; min-width: 32px; margin-left: 0px; }
.timestamp-button svg { width: 24px; height: 24px; }

.attachWrapper-2TRKBi .timestamp-button { margin-right: 10px; }
.attachWrapper-2TRKBi .timestamp-button button { min-height: 24px; min-width: 24px; }
.attachWrapper-2TRKBi .timestamp-button svg { width: 20px; height: 20px; }`,
        buttonHTML = `<div class="buttonContainer-28fw2U timestamp-button">
    <button aria-label="Enter timestamp" type="button" class="buttonWrapper-1ZmCpA button-318s1X button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN">
        <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path fill="currentColor" d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path>
        </svg>
    </button>
</div>`,
        {DiscordSelectors, PluginUtilities, DOMTools, Modals, WebpackModules} = Api,
        {Logger, Patcher, Settings} = Library,
        DateInput = WebpackModules.getByDisplayName("DateInput"),
        TimeInput = WebpackModules.getByDisplayName("TimeInput"),
        Dropdown = WebpackModules.getByProps("SingleSelect").SingleSelect;;

    const createUpdateWrapper = (Component, changeProp = "onChange") => props => {
        const [value, setValue] = BdApi.React.useState(props["value"]);
        return BdApi.React.createElement(Component, {
            ...props,
            ["value"]: value,
            [changeProp]: value => {
                if (typeof props[changeProp] === "function") props[changeProp](value);
                setValue(value);
            }
        });
    };

    return class SendTimestamp extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.tabIndex = 1;
            this.defaultSettings.onRight = true;
        }

        onStart() {
            PluginUtilities.addStyle(this.getName(), css);
            this.addButton();
        }

        onStop() {
            this.removeButton();
            PluginUtilities.removeStyle(this.getName());
        }

        getSettingsPanel() {
            this.removeButton();
            const
                arr = [1, 2, 3, 4, 5, 6, 7, 8, 9],
                max = this.settings.onRight?document.querySelector(".buttons-3JBrkn").childElementCount:document.querySelector(".attachWrapper-2TRKBi").childElementCount;
            this.addButton();

            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Dropdown("Button Position", "Place button on right with all buttons or on left with the upload button.", this.settings.onRight, [
                    {label: "Right", value: true},
                    {label: "Left", value: false},
                ], (e) => {
                    this.settings.onRight = e;
                    this.removeButton();
                    this.addButton();
                }),
                new Settings.Slider("Position", "Position of the button from left", 1, max, this.settings.tabIndex, (e) => {
                    this.settings.tabIndex = e;
                    this.removeButton();
                    this.addButton();
                }, {
                    markers: arr.slice(0, max+1),
                    stickToMarkers: true
                }),
            );
        }

        removeButton() {
            const button = document.querySelector(".timestamp-button");
            if (button) button.remove();
        }

        addButton() {
            const
                form = document.querySelector("form"),
                button = DOMTools.createElement(buttonHTML);
            
            if (form.querySelector(".timestamp-button")) return;

            if (this.settings.onRight) {
                if (this.settings.tabIndex > document.querySelector(".buttons-3JBrkn").childElementCount) this.settings.tabIndex = document.querySelector(".buttons-3JBrkn").childElementCount+1;

                if (this.settings.tabIndex==1) form.querySelector(`.buttons-3JBrkn`).prepend(button);
                else form.querySelector(`.buttons-3JBrkn > *:nth-child(${this.settings.tabIndex-1})`).after(button);
            }
            else {
                if (this.settings.tabIndex > document.querySelector(".attachWrapper-2TRKBi").childElementCount) this.settings.tabIndex = document.querySelector(".attachWrapper-2TRKBi").childElementCount+1;

                if (this.settings.tabIndex==1) form.querySelector(`.attachWrapper-2TRKBi`).prepend(button);
                else form.querySelector(`.attachWrapper-2TRKBi > *:nth-child(${this.settings.tabIndex-1})`).after(button);
            };
        
            button.on("click", this.showTimesampModal);
        }

        showTimesampModal() {
            const { FormItem } = BdApi.findModuleByProps("FormItem");
            
            let inputDate = new Date(), inputTime = new Date(), inputFormat = "f",
                blank = BdApi.React.createElement(FormItem, { title: " " }),
                dateInput = BdApi.React.createElement(FormItem, {
                    title: "Date",
                    children: [
                        BdApi.React.createElement(createUpdateWrapper(DateInput, "onSelect"), { onSelect: (date) => { inputDate = date._d } }),
                    ]
                }),
                timeInput = BdApi.React.createElement(FormItem, {
                    title: "Time",
                    children: [
                        BdApi.React.createElement(createUpdateWrapper(TimeInput), { onChange: (time) => { inputTime = time._d } })
                    ]
                }),
                formatInput = BdApi.React.createElement(FormItem, {
                    title: "Format",
                    children: [
                        BdApi.React.createElement(createUpdateWrapper(Dropdown), { onChange: (format) => inputFormat = format, value: inputFormat, options: [{value: "t", label: "Short Time"}, {value: "T", label: "Long Time"}, {value: "d", label: "Short Date"}, {value: "D", label: "Long Date"}, {value: "f", label: "Short Date/Time"}, {value: "F", label: "Long Date/Time"}, {value: "R", label: "Relative Time"}] })
                    ]
                });

            Modals.showModal( "Select Date and Time", [ dateInput, blank, timeInput, formatInput ], {
                confirmText: "Enter",
                onConfirm: () => {
                    let timestamp = new Date();

                    timestamp.setDate(inputDate.getDate());
                    timestamp.setMonth(inputDate.getMonth());
                    timestamp.setFullYear(inputDate.getFullYear());

                    timestamp.setHours(inputTime.getHours());
                    timestamp.setMinutes(inputTime.getMinutes());
                    timestamp.setSeconds(0);
                
                    BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed(BdApi.findModuleByProps("ComponentActions").ComponentActions.INSERT_TEXT, {content: `<t:${Math.floor(timestamp.getTime()/1000)}:${inputFormat}> `});
                }
            });
        }

        observer(e) {
            if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
            if (e.addedNodes[0].querySelector(DiscordSelectors.Textarea.inner)) {
                this.addButton(e.addedNodes[0]);
            }
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/