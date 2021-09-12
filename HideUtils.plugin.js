/**
 * @name HideUtils
 * @author Arashiryuu
 * @version 2.1.46
 * @description Allows you to hide users, servers, and channels individually.
 * @authorId 238108500109033472
 * @authorLink https://github.com/Arashiryuu
 * @website https://github.com/Arashiryuu/crap
 * @source https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideUtils/HideUtils.plugin.js
 */

/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject('WScript.Shell');
	var fs = new ActiveXObject('Scripting.FileSystemObject');
	var pathPlugins = shell.ExpandEnvironmentStrings('%APPDATA%\\BetterDiscord\\plugins');
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup('It looks like you\'ve mistakenly tried to run me directly. \n(Don\'t do that!)', 0, 'I\'m a plugin for BetterDiscord', 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup('I\'m in the correct folder already.\nJust reload Discord with Ctrl+R.', 0, 'I\'m already installed', 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup('I can\'t find the BetterDiscord plugins folder.\nAre you sure it\'s even installed?', 0, 'Can\'t install myself', 0x10);
	} else if (shell.Popup('Should I copy myself to BetterDiscord\'s plugins folder for you?', 0, 'Do you need some help?', 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec('explorer ' + pathPlugins);
		shell.Popup('I\'m installed!\nJust reload Discord with Ctrl+R.', 0, 'Successfully installed', 0x40);
	}
	WScript.Quit();

@else@*/

var HideUtils = (() => {

	/* Config */
	
	const config = {
		main: 'index.js',
		info: {
			name: 'HideUtils',
			authors: [
				{
					name: 'Arashiryuu',
					discord_id: '238108500109033472',
					github_username: 'Arashiryuu',
					twitter_username: ''
				}
			],
			version: '2.1.46',
			description: 'Allows you to hide users, servers, and channels individually.',
			github: 'https://github.com/Arashiryuu',
			github_raw: 'https://raw.githubusercontent.com/Arashiryuu/crap/master/ToastIntegrated/HideUtils/HideUtils.plugin.js',
			github_source: 'https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideUtils/HideUtils.plugin.js'
		},
		changelog: [
			{
				title: 'Maintenance!',
				type: 'improved',
				items: [
					'Fix voice channels disappearing when people join them.'
				]
			}
		]
	};

	/* Utility */

	const log = function() {
		const parts = [
			`%c[${config.info.name}]%c %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];
		console.group.apply(null, parts);
		console.log.apply(null, arguments);
		console.groupEnd();
	};

	const err = function() {
		const parts = [
			`%c[${config.info.name}]%c %s`,
			'color: #3A71C1; font-weight: 700;',
			'',
			new Date().toUTCString()
		];
		console.group.apply(null, parts);
		console.error.apply(null, arguments);
		console.groupEnd();
	};
	
	/* Build */

	const buildPlugin = ([Plugin, Api]) => {
        const { Toasts, Logger, Patcher, Settings, Utilities, ContextMenu, DOMTools, ReactTools, ReactComponents, DiscordModules, DiscordClasses, WebpackModules, DiscordSelectors, PluginUtilities } = Api;
		const { SettingPanel, SettingField, SettingGroup, Switch } = Settings;
		const { ComponentDispatch: Dispatcher } = WebpackModules.getByProps('ComponentDispatch');
		const { React, ReactDOM, ModalStack, ContextMenuActions: MenuActions } = DiscordModules;
	
		const TextElement = WebpackModules.getByDisplayName('Text');
		const TooltipWrapper = WebpackModules.getByPrototypes('renderTooltip');
	
		const has = Object.prototype.hasOwnProperty;
		const slice = Array.prototype.slice;
		const Menu = WebpackModules.getByProps('MenuItem', 'MenuGroup', 'MenuSeparator');
		const ToggleMenuItem = WebpackModules.getByString('disabled', 'itemToggle');
		const guilds = WebpackModules.getByProps('wrapper', 'unreadMentionsIndicatorTop');
		const buttons = WebpackModules.getByProps('button');
		const positionedContainer = WebpackModules.getByProps('positionedContainer');
		const messagesWrapper = WebpackModules.getByProps('messages', 'messagesWrapper');
		const wrapper = WebpackModules.getByProps('messagesPopoutWrap');
		const scroller = WebpackModules.getByProps('scrollerWrap');
		// const dividerContent = WebpackModules.getByProps('divider', 'dividerRed', 'dividerContent');
		const MessageClasses = {
			...WebpackModules.getByProps('messageCompact', 'headerCozy', 'username'),
			...WebpackModules.getByProps('message', 'groupStart')
		};
		const ContextMenuClasses = WebpackModules.getByProps('menu', 'scroller');
		const Lists = WebpackModules.getByProps('ListThin');
	
		const Button = class Button extends React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}
	
			onClick(e) {
				if (this.props.action) this.props.action(e);
			}
	
			render() {
				const style = this.props.style || {};
				return React.createElement('button', {
					style,
					className: this.props.className || 'button',
					onClick: this.onClick
				}, this.props.text);
			}
		};
	
		const CloseButton = class CloseButton extends React.Component {
			constructor(props) {
				super(props);
				this.onClick = this.onClick.bind(this);
			}
	
			onClick() {
				if (this.props.onClick) this.props.onClick();
			}
	
			render() {
				return React.createElement('svg', {
					className: 'close-button',
					width: 16,
					height: 16,
					viewBox: '0 0 24 24',
					onClick: this.onClick
				},
					React.createElement('path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' }),
					React.createElement('path', { d: 'M0 0h24v24H0z', fill: 'none' })
				);
			}
		};
	
		const ListText = class ListText extends React.Component {
			constructor(props) {
				super(props);
			}
	
			render() {
				return React.createElement('li', {
					className: 'list-element-item'
				}, this.props.text);
			}
		};
	
		const ReactUL = class ReactUL extends React.Component {
			constructor(props) {
				super(props);
			}
	
			prepareChildren(children) {
				if (!children.length) return children;
				return children.map((child) => React.createElement(ListText, { text: child }));
			}
	
			render() {
				return React.createElement('ul', {
					className: 'list-element',
					children: this.prepareChildren(this.props.children || [])
				});
			}
		};
	
		const Modal = class Modal extends React.Component {
			constructor(props) {
				super(props);
				this._labels = {
					'Channels': 'ID: {{id}}\nGuild: {{guild}}\nChannel: {{channel}}',
					'Servers': 'ID: {{id}}\nGuild: {{guild}}',
					'Folders': 'ID: {{id}}\nName: {{name}}',
					'Users': 'ID: {{id}}\nTag: {{tag}}'
				};
				this.close = this.close.bind(this);
				this.replaceLabels = this.replaceLabels.bind(this);
			}

			static modalKey = 'HideUtils-SettingsModal';
	
			close() {
				ModalStack.popWithKey(Modal.modalKey);
			}
	
			replaceLabels(label, data) {
				if (!has.call(this._labels, label)) return null;
	
				const string = this._labels[label];
	
				if (label === 'Channels') return string
					.replace(/{{id}}/, data.id)
					.replace(/{{guild}}/, data.guild)
					.replace(/{{channel}}/, data.name);
	
				if (label === 'Servers') return string
					.replace(/{{id}}/, data.id)
					.replace(/{{guild}}/, data.name);
	
				if (label === 'Folders') return string
					.replace(/{{id}}/, data.id)
					.replace(/{{name}}/, data.name);
	
				return string
					.replace(/{{id}}/, data.id)
					.replace(/{{tag}}/, data.tag);
			}
	
			render() {
				const label = this.props.name;
				const data = [];
	
				if (this.props.data) {
					for (const entry of Object.values(this.props.data)) {
						if (Array.isArray(entry)) continue;
	
						const item = React.createElement(TooltipWrapper, {
							text: this.replaceLabels(label, entry),
							color: TooltipWrapper.Colors.PRIMARY,
							position: TooltipWrapper.Positions.TOP,
							children: (props) => {
								const type = label.slice(0, -1);
								const hasImage = type === 'User' || type === 'Server';
								const style = {};
	
								if (hasImage) Object.assign(style, {
									backgroundImage: `url(${entry.icon})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
									textShadow: '0 0 1px black, 0 0 2px black, 0 0 3px black'
								});
	
								return React.createElement('div', Object.assign({
									className: 'buttonWrapper'
								}, props),
									React.createElement(Button, {
										text: entry.name ? entry.name : entry.tag,
										className: `${type.toLowerCase()}-button`,
										style,
										action: () => {
											Dispatcher.dispatch(`HIDEUTILS_BUTTON_${type.toUpperCase()}CLEAR`, entry.id);
											this.forceUpdate();
										}
									})
								);
							}
						});
	
						data.push(item);
					}
	
					const count = React.createElement(TextElement, {
						color: TextElement.Colors.BRAND,
						size: TextElement.Sizes.SIZE_16,
						style: {
							textTransform: 'uppercase',
							borderBottom: '2px solid currentColor',
							marginBottom: '4px',
							fontWeight: 'bold'
						},
						children: [label, ' hidden \u2014 ', data.length]
					});
	
					data.unshift(count, React.createElement('hr', { style: { border: 'none' } }));
				} else {
					data.push(
						React.createElement('div', {
							id: 'HideUtils-Instructions',
							className: 'instructions'
						},	
							React.createElement(TextElement, {
								color: TextElement.Colors.STANDARD,
								children: [
									React.createElement(TextElement, {
										color: TextElement.Colors.BRAND,
										size: TextElement.Sizes.SIZE_16,
										style: {
											textTransform: 'uppercase',
											borderBottom: '2px solid currentColor',
											marginBottom: '4px',
											fontWeight: 'bold'
										},
										children: ['How to']
									}),
									React.createElement(ReactUL, {
										children: [
											'Right-click on a channel, server, or user.',
											'Left-click the hide option in the context-menu.'
										]
									}),
									React.createElement('br', {}),
									React.createElement(TextElement, {
										color: TextElement.Colors.BRAND,
										size: TextElement.Sizes.SIZE_16,
										style: {
											textTransform: 'uppercase',
											borderBottom: '2px solid currentColor',
											marginBottom: '4px',
											fontWeight: 'bold'
										},
										children: ['Note']
									}),
									React.createElement(ReactUL, {
										children: [
											'Unhiding requires use of the settings-panel, and is not handled within a context-menu.',
											'Click on a hidden element in its respective settings modal to unhide it.'
										]
									})
								]
							})
						)
					);
				}
	
				return React.createElement('div', {
					id: 'HideUtils-Modal',
					className: `${wrapper.messagesPopoutWrap} ${DiscordClasses.Popouts.themedPopout}`
				},
					React.createElement('div', {
						id: 'HideUtils-Header',
						className: `${wrapper.header} ${DiscordClasses.Popouts.header}`
					},
						React.createElement(CloseButton, {
							onClick: this.close
						}),
						React.createElement(TextElement, {
							className: wrapper.title,
							color: TextElement.Colors.STANDARD,
							size: TextElement.Sizes.SIZE_16,
							children: ['HideUtils \u2014 ', label]
						})
					),
					React.createElement('div', {
						className: scroller.scrollerWrap
					},
						React.createElement('div', {
							className: `${scroller.scroller} ${wrapper.messagesPopout}`,
							scrollable: true,
							children: data
						})
					)
				);
			}
		};
	
		const Select = class Select extends React.Component {
			constructor(props) {
				super(props);
				this.openInstructions = this.openInstructions.bind(this);
				this.openChannels = this.openChannels.bind(this);
				this.openFolders = this.openFolders.bind(this);
				this.openServers = this.openServers.bind(this);
				this.openUsers = this.openUsers.bind(this);
			}
	
			openFolders() {
				ModalStack.push(Modal, { name: 'Folders', data: this.props.folders }, Modal.modalKey);
			}
	
			openChannels() {
				ModalStack.push(Modal, { name: 'Channels', data: this.props.channels }, Modal.modalKey);
			}
	
			openServers() {
				ModalStack.push(Modal, { name: 'Servers', data: this.props.servers }, Modal.modalKey);
			}
	
			openUsers() {
				ModalStack.push(Modal, { name: 'Users', data: this.props.users }, Modal.modalKey);
			}
	
			openInstructions() {
				ModalStack.push(Modal, { name: 'Instructions', data: null }, Modal.modalKey);
			}
	
			render() {
				return React.createElement('div', {
					id: 'HideUtils-Settings',
					className: 'HUSettings'
				},
					React.createElement('div', {
						id: 'Setting-Select',
						className: 'container'
					},
						React.createElement('h3', {
							className: 'settingsHeader'
						},
							React.createElement('div', {
								id: 'HideUtils-ButtonGroup',
								className: 'buttonGroup'
							},
								React.createElement(Button, {
									text: 'Folders',
									action: this.openFolders
								}),
								React.createElement(Button, {
									text: 'Channels',
									action: this.openChannels
								}),
								React.createElement(Button, {
									text: 'Servers',
									action: this.openServers
								}),
								React.createElement(Button, {
									text: 'Users',
									action: this.openUsers
								}),
								React.createElement(Button, {
									text: 'Instructions',
									action: this.openInstructions
								})
							)
						)
					)
				);
			}
		};
	
		const SelectionField = class SelectionField extends SettingField {
			constructor(name, note, data, onChange) {
				super(name, note, onChange, Select, {
					users: data.users,
					servers: data.servers,
					folders: data.folders,
					channels: data.channels
				});
			}
		};
		
		let subscription;

		return class HideUtils extends Plugin {
			constructor() {
				super();
				this._css;
				this.promises = {
					state: { cancelled: false },
					cancel() { this.state.cancelled = true; },
					restore() { this.state.cancelled = false; }
				};
				this.default = {
					channels: {},
					servers: { unhidden: [] },
					users: {},
					folders: {},
					hideBlocked: true
				};
				this.settings = null;
				this.css = `
					.theme-light #HideUtils-Header .close-button {
						fill: #72767d;
					}
					#HideUtils-Header + div > div:first-child {
						position: relative;
					}
					#HideUtils-Header .close-button {
						fill: white;
						cursor: pointer;
						opacity: 0.6;
						float: right;
						transition: opacity 200ms ease;
					}
					#HideUtils-Header .close-button:hover {
						opacity: 1;
					}
					#HideUtils-Settings {
						overflow-x: hidden;
					}
					#HideUtils-Settings h3 {
						text-align: center;
						color: #CCC;
					}
					#HideUtils-Settings #HideUtils-ButtonGroup .button {
						background: #7289DA;
						color: #FFF;
						border-radius: 5px;
						margin: 5px;
						height: 30px;
						width: auto;
						min-width: 6vw;
						padding: 0 1vw;
					}
					#HideUtils-Settings button,
					.buttonWrapper button {
						background: #7289DA;
						color: #FFF;
						width: 5vw;
						height: 30px;
						border-radius: 5px;
						padding: 0;
						font-size: 14px;
					}
					.buttonWrapper {
						display: inline-block;
						margin: 5px;
						overflow-y: auto;
					}
					.buttonWrapper button {
						/*overflow: hidden;
						width: 5vw;
						height: 30px;
						word-break: break-word;
						white-space: nowrap;
						text-overflow: ellipsis;*/
						min-height: 5vh;
						min-width: 5vw;
						height: 5vh;
						width: auto;
						max-height: 10vh;
						max-width: 10vw;
						font-size: 10pt;
						word-break: break-word;
						word-wrap: break-word;
						text-overflow: ellipsis;
						padding: 0 5px;
						display: flex;
						justify-content: center;
						align-items: center;
						overflow: hidden;
					}
					#HideUtils-Settings .icons .container::-webkit-scrollbar {
						width: 7px !important;
						background: rgba(0, 0, 0, 0.4);
					}
					#HideUtils-Settings .icons .container::-webkit-scrollbar-thumb {
						min-height: 20pt !important;
						min-width: 20pt !important;
						background: rgba(255, 255, 255, 0.6) !important;
					}
					#HideUtils-Instructions .list-element {
						margin: 8px 0 8px 6px;
					}
					#HideUtils-Instructions .list-element-item {
						position: relative;
						margin-left: 15px;
						margin-bottom: 8px;
					}
					#HideUtils-Instructions .list-element-item:last-child {
						margin-bottom: 0;
					}
					#HideUtils-Instructions .list-element-item::before {
						content: '';
						position: absolute;
						background: #DCDDDE;
						top: 10px;
						left: -15px;
						width: 6px;
						height: 6px;
						margin-top: -4px;
						margin-left: -3px;
						border-radius: 50%;
						opacity: 0.3;
					}
					.theme-light #HideUtils-Instructions .list-element-item::before {
						background: #72767D;
					}
				`;
				this.userClear = this.userClear.bind(this);
				this.servClear = this.servClear.bind(this);
				this.chanClear = this.chanClear.bind(this);
				this.foldClear = this.foldClear.bind(this);
				this.subscriptions = [
					['USERCLEAR', this.userClear],
					['SERVERCLEAR', this.servClear],
					['FOLDERCLEAR', this.foldClear],
					['CHANNELCLEAR', this.chanClear]
				];
				this.channel;
				this.guild;
				this.user;
				this.mute;
			}
	
			/* Methods */
	
			setup() {
				this.channel = DiscordModules.ChannelStore.getChannel;
				this.guild = DiscordModules.GuildStore.getGuild;
				this.user = DiscordModules.UserStore.getUser;
				this.mute = WebpackModules.getByProps('setLocalVolume').setLocalVolume;
			}
	
			subscribe() {
				for (const [type, callback] of this.subscriptions) Dispatcher.subscribe(`HIDEUTILS_BUTTON_${type}`, callback);
			}
	
			unsubscribe() {
				for (const [type, callback] of this.subscriptions) Dispatcher.unsubscribe(`HIDEUTILS_BUTTON_${type}`, callback);
				if (subscription) {
					DOMTools.observer.unsubscribe(subscription);
					subscription = null;
				}
			}
	
			onStart() {
				this.promises.restore();
				PluginUtilities.addStyle(this.short, this.css);
				this.setup();
				this.settings = this.loadSettings(this.default);
				this.subscribe();
				this.patchAll(this.promises.state);
				Toasts.info(`${this.name} ${this.version} has started!`, { timeout: 2e3 });
			}
	
			onStop() {
				this.promises.cancel();
				PluginUtilities.removeStyle(this.short);
				this.unsubscribe();
				Patcher.unpatchAll();
				this.updateAll();
				Toasts.info(`${this.name} ${this.version} has stopped!`, { timeout: 2e3 });
			}
	
			patchAll(promiseState) {
				this.patchGuilds(promiseState);
				this.patchChannels(promiseState);
				this.patchMessages(promiseState);
				this.patchMemberList(promiseState);
				this.patchTypingUsers(promiseState);
				this.patchContextMenu(promiseState);
				this.patchIsMentioned(promiseState);
				this.patchReceiveMessages(promiseState);
			}
	
			updateAll() {
				this.updateGuilds();
				this.updateChannels();
				this.updateMessages();
				this.updateMemberList();
				this.updateContextMenu();
			}
	
			patchReceiveMessages() {
				Patcher.instead(DiscordModules.MessageActions, 'receiveMessage', (that, args, value) => {
					const [channelId, { author }] = args;
					const channel = this.channel(channelId);
					if (has.call(this.settings.users, author.id) || DiscordModules.RelationshipStore.isBlocked(author.id)) return false;
					if (has.call(this.settings.channels, channelId)) return false;
					const guild = this.guild(channel.guild_id);
					const isHiddenFolderMention = slice.call(Object.values(this.settings.folders)).some((folder) => {
						const servers = [...Object.values(folder.servers)];
						return servers.includes(channel.guild_id);
					});
					if (!guild) return value.apply(that, args);
					if (has.call(this.settings.servers, guild.id)) return false;
					if (isHiddenFolderMention) return false;
					return value.apply(that, args);
				});
			}
	
			patchIsMentioned() {
				const Module = WebpackModules.getByProps('isMentioned', 'isRawMessageMentioned');
				const { getMentions } = WebpackModules.getByProps('getMentions');
				let o = getMentions();
				Patcher.instead(Module, 'isMentioned', (that, args, value) => {
					const { 0: currentUserId, 1: channelId, 3: mentionList } = args;
					const channel = this.channel(channelId);
					if (!channel) return value.apply(that, args);
					const guild = this.guild(channel.guild_id);
					const isHiddenFolderMention = () => slice.call(Object.values(this.settings.folders)).some((folder) => {
						const servers = [...Object.values(folder.servers)];
						return servers.includes(guild.id);
					});
					const n = getMentions() && o ? getMentions().filter((m) => !o.includes(m.id)) : [];
					if (!n.length) return value.apply(that, args);
					const thisMention = n.find((mention) => mention.channel_id === channelId && mention.mentions.includes(currentUserId));
					const mentionIndex = n.find((mention) => mention.channel_id === channelId && mention.mentions.includes(currentUserId));
					if (!thisMention) return value.apply(that, args);
					o = o.concat(n);
					getMentions().splice(mentionIndex, 1);
					const { author } = thisMention;
					if (author && has.call(this.settings.users, author.id) || has.call(this.settings.channels, channelId)) return false;
					if (!guild || !guild.id) return value.apply(that, args);
					if (has.call(this.settings.servers, guild.id) || isHiddenFolderMention()) return false;
					return value.apply(that, args);
				});
			}
	
			async patchTypingUsers(promiseState) {
				const { component: TypingUsers } = await ReactComponents.getComponentByName('TypingUsers', DiscordSelectors.Typing.typing.toString()); // WebpackModules.getByDisplayName('FluxContainer(TypingUsers)');
				if (promiseState.cancelled) return;
				Patcher.before(TypingUsers.prototype, 'render', ({ props: { typingUsers } }) => {
					for (const id in typingUsers) has.call(this.settings.users, id) && delete typingUsers[id];
				}, { displayName: 'TypingUsers' });
			}
	
			async patchChannelContextMenu(promiseState) {
				const Context = WebpackModules.find((mod) => mod?.default?.displayName === 'ChannelListTextChannelContextMenu');
				// const Component = await PluginUtilities.getContextMenu('CHANNEL_LIST_');
				if (promiseState.cancelled) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					const [props] = args;
					const channel = this.getProps(props, 'channel');
					const orig = this.getProps(value, 'props');
					const itemProps = {
						id: 'hide-channel-hide-utils',
						label: 'Hide Channel',
						action: () => {
							MenuActions.closeContextMenu();
							this.chanPush(channel.id);
						}
					};
	
					if (this.settings.servers.unhidden.includes(channel.guild_id) && has.call(this.settings.channels, channel.id)) {
						itemProps.id = 'unhide-channel-hide-utils';
						itemProps.label = 'Unhide Channel';
						itemProps.action = () => {
							MenuActions.closeContextMenu();
							this.chanClear(channel.id);
						};
					}
	
					const item = React.createElement(Menu.MenuItem, itemProps);
					const group = React.createElement(Menu.MenuGroup, { children: item });
	
					if (Array.isArray(orig.children)) orig.children.splice(1, 0, group);
					else orig.children = [orig.children], orig.children.splice(1, 0, group);
	
	
					return value;
				});
				this.updateContextMenu();
			}
	
			async patchGuildContextMenu(promiseState) {
				const Context = WebpackModules.find((mod) => mod?.default?.displayName === 'GuildContextMenu');
				if (promiseState.cancelled) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					const [props] = args;
					if (!props.guild) return value;
					const orig = this.getProps(value, 'props');
					const id = this.getProps(props, 'guild.id');
					const active = this.settings.servers.unhidden.includes(id);
	
					if (!orig || !id) return;
	
					const topSeparator = React.createElement(Menu.MenuSeparator, {});
					const bottomSeparator = React.cloneElement(topSeparator);
	
					const hideItem = React.createElement(Menu.MenuItem, {
						id: 'hide-server-hide-utils',
						label: 'Hide Server',
						action: () => {
							MenuActions.closeContextMenu();
							this.servPush(id);
							this.clearUnhiddenChannels(id);
						}
					});
	
					const unhideItem = React.createElement(Menu.MenuCheckboxItem, {
						id: 'unhide-channels-hide-utils',
						label: 'Unhide Channels',
						checked: active,
						action: () => {
							this.servUnhideChannels(id);
							this.updateContextMenu();
						}
					});
	
					const clearItem = React.createElement(Menu.MenuItem, {
						id: 'purge-channels-hide-utils',
						label: 'Purge Hidden Channels',
						color: 'colorDanger',
						action: () => {
							MenuActions.closeContextMenu();
							this.chanPurge(id);
						}
					});
	
					const children = [
						hideItem,
						unhideItem,
						clearItem,
						bottomSeparator
					];
	
					const group = React.createElement(Menu.MenuGroup, {
						key: 'HideUtils-HideItemGroup',
						children
					});
					const fn = (child) => child && child.key && child.key === 'HideUtils-HideItemGroup';
	
					if (!Array.isArray(orig.children)) orig.children = [orig.children];
					if (!orig.children.some(fn)) orig.children.splice(1, 0, group);
	
					return value;
				});
				PluginUtilities.forceUpdateContextMenus();
			}

			patchGuildFolderContextMenu(promiseState) {
				const Context = WebpackModules.find((mod) => mod?.default?.displayName === 'GuildFolderContextMenu');
				if (promiseState.cancelled || !Context) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					const [props] = args;
					log(props, value);
					if (!props.folderId) return value;
					//
					return value;
				});
				PluginUtilities.forceUpdateContextMenus();
			}
	
			patchUserContextMenu(promiseState) {
				const Context = WebpackModules.find((mod) => mod?.default?.displayName === 'GuildChannelUserContextMenu');
				if (promiseState.cancelled || !Context) return;
				Patcher.after(Context, 'default', (that, args, value) => {
					if (!DiscordModules.GuildStore.getGuild(DiscordModules.SelectedGuildStore.getGuildId())) return value;
					const [props] = args;
					if (!props.user) return value;
					const orig = this.getProps(value, 'props.children.props');
					const user = this.getProps(props, 'user');
					if (!orig || !user) return value;
					
					const item = React.createElement(Menu.MenuItem, {
						id: 'hide-user-hide-utils',
						label: 'Hide User',
						action: () => {
							MenuActions.closeContextMenu();
							this.userPush(user.id);
						}
					});
	
					const profileGroup = this.getProps(orig, 'children.1.props.children');
					const fn = (child) => child && child.id && child.id === 'hide-user-hide-utils';
					
					if (profileGroup.some(fn)) return value;
					profileGroup.splice(1, 0, item);

					return value;
				});
				PluginUtilities.forceUpdateContextMenus();
			}
	
			async patchContextMenu(promiseState) {
				if (promiseState.cancelled) return;
				this.patchUserContextMenu(promiseState);
				this.patchGuildContextMenu(promiseState);
				this.patchChannelContextMenu(promiseState);
			}
	
			updateContextMenu() {
				const menus = document.querySelectorAll(DiscordSelectors.ContextMenu.menu.value.trim());
				if (!menus.length) return;
				for (let i = 0, len = menus.length; i < len; i++) ReactTools.getOwnerInstance(menus[i]).forceUpdate();
			}
	
			updateContextPosition(m) {
				if (!m) return;
	
				let height = this.getProps(m, 'updatePosition');
				if (!height) height = this.getProps(m, 'props.onHeightUpdate');
				if (!height) height = this.getProps(m, '_reactInternalFiber.return.memoizedProps.onHeightUpdate');
				if (!height) height = this.getProps(m, '_reactInternalFiber.child.child.memoizedProps.onHeightUpdate');
	
				if (typeof height === 'function') height();
			}
	
			/**
			 * @name patchMessageComponent
			 * @author Zerebos
			 */
			async patchMessages(promiseState) {
				if (promiseState.cancelled) return;
				const t = await new Promise((resolve, reject) => {
					subscription = DOMTools.observer.subscribeToQuerySelector(() => {
						const instance = ReactTools.getReactInstance(document.querySelector('[data-list-id="chat-messages"]'));
						const forwarded = Utilities.findInTree(instance, (tree) => {
							if (!tree) return false;
							const forward = String(tree['$$typeof']).includes('react.forward_ref');
							const string = tree.render?.toString().includes('contentClassName');
							return forward && string;
						}, {
							walkable: [
								'return',
								'type'
							]
						});
						if (instance && forwarded) resolve(forwarded);
						else resolve(null);
					}, '.chat-3bRxxu', null, true);
				});
				if (!t) return;
				Patcher.before(t, 'render', (that, args, value) => {
					const [props] = args;
					const children = this.getProps(props, 'children.props.children');
					const list = this.getProps(children, '1');
					children[1] = list.filter((message) => {
						if (!message || message.key && (message.key.includes('divider') || ['has-more', 'buffer'].some((k) => message.key === k))) return message;
						const author = this.getProps(message, 'props.message.author');
						const type = this.getProps(message, 'type.type');
						const blocked = Boolean((type && type.displayName && type.displayName === 'BlockedMessages') && this.settings.hideBlocked);
						return !blocked && author && !has.call(this.settings.users, author.id) || !blocked && !author;
					});
				});
				this.updateMessages();
			}
	
			/**
			 * @name forceUpdateMessages
			 * @author Zerebos
			 */
			updateMessages() {
				const messages = document.querySelector(`.${messagesWrapper.messagesWrapper.replace(/\s/, '.')}`);
				if (messages) ReactTools.getOwnerInstance(messages).forceUpdate();
			}
	
			async patchGuilds(state) {
				const Guilds = await new Promise((resolve) => {
					const guildsWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
					if (guildsWrapper) return resolve(ReactTools.getOwnerInstance(guildsWrapper).constructor);
				});
				if (state.cancelled) return;
				Patcher.after(Guilds.prototype, 'render', (that, args, value) => {
					const props = this.getProps(that, 'props');
					if (!props.guildFolders || !Array.isArray(props.guildFolders)) return value;
	
					const orig = this.getProps(value, 'props.children');
					if (!orig || typeof orig !== 'function' || value.props.children.__patched_HideUtils) return value;

					value.props.children = (...props) => {
						const o = orig(...props);
						const oChild = this.getProps(o, 'props.children.props.children');
						if (!oChild || oChild.__patched_HideUtils) return o;
						o.props.children.props.children = (...data) => {
							const oValue = oChild(...data);
							const list = this.getProps(oValue, 'props.children.1.props.children');
							if (!list) return oValue;
							const guildsList = list.find((child) => child && child.type && child.type === 'div');
							if (!guildsList) return oValue;
							guildsList.props.children = guildsList.props.children.filter((guild) => {
								if (Array.isArray(guild.props.guildIds)) {
									if (has.call(this.settings.folders, guild.props.folderId)) return false;
									guild.props.guildIds = guild.props.guildIds.filter((id) => !has.call(this.settings.servers, id));
									if (!guild.props.guildIds.length) return false;
									return true;
								}
								return !guild || !guild.key || !has.call(this.settings.servers, guild.key);
							});
							return oValue;
						};
						o.props.children.props.children.__patched_HideUtils = true;
						return o;
					};
					value.props.children.__patched = true;
					value.props.children.__patched_HideUtils = true;
	
					return value;
				});
	
				this.updateGuilds();
			}
	
			updateGuilds() {
				const guildWrapper = document.querySelector(`.${guilds.wrapper.replace(/\s/, '.')}`);
				if (guildWrapper) ReactTools.getOwnerInstance(guildWrapper).forceUpdate();
			}
	
			patchMemberList(state) {
				if (state.cancelled) return;
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const [props] = args;
					if (!props || !props['data-list-id'] || !props['data-list-id'].startsWith('members')) return value;

					const target = Array.isArray(value)
						? value.find((i) => i && !i.key)
						: value;
					const childProps = this.getProps(target, 'props.children.props.children.props');
					if (!childProps) return value;
					const children = this.getProps(childProps, 'children');
					if (!children || !Array.isArray(children)) return value;
	
					childProps.children = children.filter((user) => {
						if (!user.key || !user.key.startsWith('member')) return true;
						const { 1: id } = user.key.split('-');
						return !has.call(this.settings.users, id);
					}).map((entry, i, arr) => {
						// hide groups with no users under them
						if (!entry) return null;
						const { key } = entry;
						const next = arr[i + 1];
						const sect = (item) => item && item.key.startsWith('section-');
						const bool = sect(next);
						if (key.startsWith('section-') && bool) return null;
						return entry;
					});
	
					return value;
				});
	
				this.updateMemberList();
			}
	
			updateMemberList() {
				const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
				if (!memberList) return;
				const owner = ReactTools.getOwnerInstance(memberList);
				owner.forceUpdate();
				if (owner.handleScroll) owner.handleScroll();
			}
	
			patchChannels(state) {
				if (state.cancelled) return;	
				Patcher.after(Lists.ListThin, 'render', (that, args, value) => {
					const [props] = args;
					if (!props || !props.id || !props.id.startsWith('channels')) return value;
					
					const childProps = this.getProps(value, 'props.children.props.children.props');
					const children = this.getProps(childProps, 'children');
					if (!children || !Array.isArray(children)) return value;
	
					const guildId = this.getProps(children, '1.props.channel.guild_id');
					if (this.settings.servers.unhidden.includes(guildId)) return value;
	
					childProps.children = children.map((channel) => {
						if (!channel) return channel;
						const channelProps = this.getProps(channel, 'props');
						if (!channelProps.voiceStates || !Array.isArray(channelProps.voiceStates)) {
							if (channel.key && !has.call(this.settings.channels, channel.key)) return channel;
							return null;
						}
						channelProps.voiceStates = channelProps.voiceStates.filter((user) => {
							if (!user) return false;
							const { voiceState: { userId } } = user;
							if (!has.call(this.settings.users, userId)) return true;
							this.mute(userId, 0);
							return false;
						});
						// weird voice channel bug fix
						if (channel.type && channel.type.displayName === 'ConnectedVoiceChannel') return channel;
						return channel.key && !has.call(this.settings.channels, channel.key);
					});
	
					return value;
				});
	
				this.updateChannels();
			}
	
			updateChannels() {
				const channels = document.querySelector(`.${positionedContainer.positionedContainer.replace(/\s/, '.')}`);
				if (channels) ReactTools.getOwnerInstance(channels).forceUpdate();
			}
	
			processContextMenu(cm) {
				if (!cm) return;
				const inst = ReactTools.getReactInstance(cm);
				const own = ReactTools.getOwnerInstance(cm);
				const props = this.getProps(inst, 'memoizedProps');
				const childProps = this.getProps(props, 'children.props');
				if (!own || !props || !Array.isArray(childProps.children)) return;
				// if (props.id === 'user-context') return this.addUserContextItems(inst, own, cm);
				// else if (props.id === 'channel-context') return this.addChannelContextItems(inst, own, cm);
				else if (props.id === 'guild-context') {
					const readItem = this.getProps(childProps, 'children.0.props.children');
					if (!readItem || Array.isArray(readItem)) return;
					if (readItem.props.id === 'mark-folder-read') return this.addFolderContextItems(inst, own, cm);
					// else if (readItem.props.id === 'mark-guild-read') return this.addGuildContextItems(inst, own, cm);
				}
			}
	
			addUserContextItems(instance, owner, context) {
				if (!DiscordModules.GuildStore.getGuild(DiscordModules.SelectedGuildStore.getGuildId())) return;
				const group = new ContextMenu.ItemGroup();
				const props = this.getProps(instance, 'return.return.return.return.return.memoizedProps');
				if (!props) return;
				const item = new ContextMenu.TextItem('Hide User', {
					callback: (e) => {
						MenuActions.closeContextMenu();
						if (!props) return;
						const { user: { id } } = props;
						this.userPush(id);
					}
				});
				const elements = item.getElement();
				const groupEl = group.getElement();
				elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
				elements.setAttribute('role', 'menuitem');
				elements.setAttribute('tabindex', '-1');
				elements.firstChild.classList.add(ContextMenuClasses.label);
				elements.addEventListener('mouseenter', (e) => {
					if (elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.add(ContextMenuClasses.focused);
				});
				elements.addEventListener('mouseleave', (e) => {
					if (!elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.remove(ContextMenuClasses.focused);
				});
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
				// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
				group.addItems(item);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}
	
			addChannelContextItems(instance, owner, context) {
				const group = new ContextMenu.ItemGroup();
				const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
				if (!ref.props.channel || typeof ref.props.channel.type === 'undefined' || ref.props.channel.type === 4) return;
				const channel = this.getProps(ref, 'props.channel');
				if (!channel) return;
				const itemProps = {
					label: 'Hide Channel',
					action: (e) => {
						MenuActions.closeContextMenu();
						this.chanPush(channel.id);
					}
				};
				if (this.settings.servers.unhidden.includes(channel.guild_id) && has.call(this.settings.channels, channel.id)) {
					itemProps.label = 'Unhide Channel';
					itemProps.action = (e) => {
						MenuActions.closeContextMenu();
						this.chanClear(channel.id);
					};
				}
				const item = new ContextMenu.TextItem(itemProps.label, { callback: itemProps.action });
				const elements = item.getElement();
				const groupEl = group.getElement();
				elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
				elements.setAttribute('role', 'menuitem');
				elements.setAttribute('tabindex', '-1');
				elements.firstChild.classList.add(ContextMenuClasses.label);
				elements.addEventListener('mouseenter', (e) => {
					if (elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.add(ContextMenuClasses.focused);
				});
				elements.addEventListener('mouseleave', (e) => {
					if (!elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.remove(ContextMenuClasses.focused);
				});
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
				// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
				group.addItems(item);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}
	
			addGuildContextItems(instance, owner, context) {
				const group = new ContextMenu.ItemGroup();
				const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
				const guild = this.getProps(ref, 'props.guild');
				const checked = this.settings.servers.unhidden.includes(guild.id);
				const item = new ContextMenu.TextItem('Hide Server', {
					callback: (e) => {
						MenuActions.closeContextMenu();
						this.servPush(guild.id);
						this.clearUnhiddenChannels(guild.id);
					}
				});
				const toggle = new ContextMenu.ToggleItem('Unhide Channels', checked, {
					callback: (e) => {
						this.servUnhideChannels(guild.id);
					}
				});
				const clear = new ContextMenu.TextItem('Purge Hidden Channels', {
					danger: true,
					callback: (e) => {
						MenuActions.closeContextMenu();
						this.chanPurge(guild.id);
					}
				});
				const firstItem = item.getElement();
				const secondItem = toggle.getElement();
				const thirdItem = clear.getElement();
				const groupEl = group.getElement();
				const grouped = [firstItem, secondItem, thirdItem];
				for (let i = 0; i < 3; i++) {
					const elements = grouped[i];
					elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
					elements.setAttribute('role', 'menuitem');
					elements.setAttribute('tabindex', '-1');
					elements.firstChild.classList.add(ContextMenuClasses.label);
					if (i === 2) elements.classList.add(ContextMenuClasses.colorDanger.split(' ')[0]);
					elements.addEventListener('mouseenter', (e) => {
						if (elements.classList.contains(ContextMenuClasses.focused)) return;
						elements.classList.add(ContextMenuClasses.focused);
					});
					elements.addEventListener('mouseleave', (e) => {
						if (!elements.classList.contains(ContextMenuClasses.focused)) return;
						elements.classList.remove(ContextMenuClasses.focused);
					});
				}
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				group.addItems(item, toggle, clear);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}
	
			addFolderContextItems(instance, owner, context) {
				const group = new ContextMenu.ItemGroup();
				const ref = owner.props.children({ position: owner.props.reference() }, owner.updatePosition);
				const target = this.getProps(ref, 'props.target');
				if (!ref || !target) return;
				const item = new ContextMenu.TextItem('Hide Folder', {
					callback: (e) => {
						MenuActions.closeContextMenu();
						const [p] = DOMTools.parents(target, '.wrapper-3Njo_c');
						if (!p) return;
						const i = ReactTools.getOwnerInstance(p);
						if (!i) return;
						this.foldPush(i);
					}
				});
				const elements = item.getElement();
				const groupEl = group.getElement();
				elements.className = `${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses.colorDefault}`;
				elements.setAttribute('role', 'menuitem');
				elements.setAttribute('tabindex', '-1');
				elements.firstChild.classList.add(ContextMenuClasses.label);
				elements.addEventListener('mouseenter', (e) => {
					if (elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.add(ContextMenuClasses.focused);
				});
				elements.addEventListener('mouseleave', (e) => {
					if (!elements.classList.contains(ContextMenuClasses.focused)) return;
					elements.classList.remove(ContextMenuClasses.focused);
				});
				groupEl.removeAttribute('class');
				groupEl.setAttribute('role', 'group');
				// elements.classList.add(...DiscordClasses.ContextMenu.clickable.value.split(' '));
				// elements.firstChild.classList.add(...DiscordClasses.ContextMenu.label.value.split(' '));
				group.addItems(item);
				context.firstChild.firstChild.firstChild.insertAdjacentElement('afterend', groupEl);
				setImmediate(() => this.updateContextPosition(owner));
			}
	
			userPush(id) {
				if (!id) return;
				const user = this.user(id);
				if (!user) return Toasts.error('Unable to find user to hide.', { timeout: 3e3 });
				if (has.call(this.settings.users, user.id)) return Toasts.info('This user is already being hidden.', { timeout: 3e3 });
				if (id === DiscordModules.UserStore.getCurrentUser().id) return Toasts.info('You cannot hide yourself.', { timeout: 3e3 });
				this.settings.users[user.id] = {
					id: user.id,
					tag: user.tag,
					icon: user.getAvatarURL()
				};
				Toasts.info('User is now being hidden!', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			userClear(id) {
				if (!id) return;
				if (!has.call(this.settings.users, id)) return Toasts.info('This user is not being hidden.', { timeout: 3e3 });
				try { this.mute(id, 100); } catch(e) { Logger.err(e); }
				delete this.settings.users[id];
				Toasts.info('User has been unhidden.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				return this.updateAll();
			}
	
			clearUnhiddenChannels(id) {
				if (!id || !this.settings.servers.unhidden.includes(id)) return false;
				this.settings.servers.unhidden.splice(this.settings.servers.unhidden.indexOf(id), 1);
				return true;
			}
	
			pushToUnhiddenChannels(id) {
				if (!id || this.settings.servers.unhidden.includes(id)) return false;
				this.settings.servers.unhidden.push(id);
				return true;
			}
	
			servUnhideChannels(id) {
				if (!id) return;
				if (!this.clearUnhiddenChannels(id) && !this.pushToUnhiddenChannels(id)) return;
	
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			servPush(id) {
				if (!id) return;
				if (has.call(this.settings.servers, id)) return Toasts.info('That server is already being hidden.', { timeout: 3e3 });
				const guild = this.guild(id);
				if (!guild) return Toasts.info('Unable to find server to hide.');
				this.settings.servers[id] = {
					id: guild.id,
					name: guild.name,
					icon: guild.getIconURL()
				};
				Toasts.info('Server has successfully been hidden.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			servClear(id) {
				if (!id) return;
				if (!has.call(this.settings.servers, id)) return Toasts.info('That server is not currently being hidden.', { timeout: 3e3 });
				delete this.settings.servers[id];
				Toasts.info('Server successfully removed!', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanPush(id) {
				if (!id) return;
				if (has.call(this.settings.channels, id)) return Toasts.info('This channel is already being hidden.', { timeout: 3e3 });
				const channel = this.channel(id);
				if (!channel) return Toasts.info('Unable to find channel to hide.', { timeout: 3e3 });
				const guild = this.guild(channel.guild_id);
				this.settings.channels[id] = {
					id: channel.id,
					name: channel.name,
					guild: guild.name
				};
				Toasts.info('Channel has successfully been hidden.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanPurge(guildId) {
				const guild = this.guild(guildId);
				const channels = Object.values(this.settings.channels).filter((chan) => {
					const c = this.channel(chan.id);
					if (!c) return false;
					return c.guild_id === guildId;
				});
				for (const channel of channels) delete this.settings.channels[channel.id];
				Toasts.info(`Channel purge for ${guild.name.trim()} was successful.`, { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			chanClear(id) {
				if (!id) return;
				if (!has.call(this.settings.channels, id)) return Toasts.info('This channel is not currently being hidden.', { timeout: 3e3 });
				delete this.settings.channels[id];
				Toasts.info('Channel successfully removed.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			foldPush(instance) {
				if (!instance) return;
				const id = instance.props.folderId;
				if (has.call(this.settings.folders, id)) return Toasts.info('This folder is already being hidden.', { timeout: 3e3 });
				this.settings.folders[id] = {
					id: id,
					name: instance.props.folderName || instance.props.defaultFolderName,
					servers: instance.props.guildIds || []
				};
				Toasts.info('Folder has successfully been hidden.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			foldClear(id) {
				if (!id) return;
				if (!has.call(this.settings.folders, id)) return Toasts.info('This folder is not currently being hidden.', { timeout: 3e3 });
				delete this.settings.folders[id];
				Toasts.info('Folder successfully removed.', { timeout: 3e3 });
				this.saveSettings(this.settings);
				this.updateAll();
			}
	
			/* Observer */
			observer({ addedNodes }) {
				for (const node of addedNodes) {
					if (!node) continue;
					if (node.firstChild && node.firstChild.className && typeof node.firstChild.className === 'string' && node.firstChild.className.split(' ')[0] === ContextMenuClasses.menu.split(' ')[0]) {
						this.processContextMenu(node.firstChild);
					}
				}
			}
	
			/**
			 * @name safelyGetNestedProps
			 * @author Zerebos
			 */
			getProps(obj, path) {
				return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
			}
	
			/* Settings Panel */
	
			getSettingsPanel() {
				return SettingPanel.build(() => this.saveSettings(this.settings),
					new SettingGroup('Plugin Settings').append(
						new SelectionField('HideUtils Setting Select', 'Select which settings you would like to visit.', this.settings, () => {}),
						new Switch('Hide Blocked User Messages', 'Whether or not to unrender messages from blocked users.', this.settings.hideBlocked, (i) => {
							this.settings.hideBlocked = i;
							this.updateAll();
						})
					)
				);
			}
	
			/* Setters */
	
			set css(style = '') {
				return this._css = style.split(/\s+/g).join(' ').trim();
			}
	
			/* Getters */
	
			get [Symbol.toStringTag]() {
				return 'Plugin';
			}
	
			get css() {
				return this._css;
			}
	
			/* eslint-disable no-undef */
	
			get name() {
				return config.info.name;
			}
	
			get short() {
				let string = '';
	
				for (let i = 0, len = config.info.name.length; i < len; i++) {
					const char = config.info.name[i];
					if (char === char.toUpperCase()) string += char;
				}
	
				return string;
			}
	
			get author() {
				return config.info.authors.map((author) => author.name).join(', ');
			}
	
			get version() {
				return config.info.version;
			}
	
			get description() {
				return config.info.description;
			}
		};
	};
	
	/* Finalize */

	return !global.ZeresPluginLibrary 
		? class {
			constructor() {
				this._config = config;
			}
			getName() {
				return config.info.name;
			}
			getAuthor() {
				return config.info.authors.map((a) => a.name).join(', ');
			}
			getDescription() {
				return config.info.description;
			}
			getVersion() {
				return config.info.version;
			}
			load() {
				const { BdApi, BdApi: { React } } = window;
				const title = 'Library Missing';
				const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
				const TextElement = BdApi.findModuleByDisplayName('Text');
				const ConfirmationModal = BdApi.findModule((m) => m.defaultProps && m.key && m.key() === 'confirm-modal');
				const children = [];
				if (!TextElement) {
					children.push(
						React.createElement('span', {
							children: [`The library plugin needed for ${config.info.name} is missing.`]
						}),
						React.createElement('br', {}),
						React.createElement('a', {
							target: '_blank',
							href: 'https://betterdiscord.app/Download?id=9',
							children: ['Click here to download the library!']
						})
					);
					return BdApi.alert(title, React.createElement('span', { children }));
				}
				children.push(
					React.createElement(TextElement, {
						color: TextElement.Colors.STANDARD,
						children: [`The library plugin needed for ${config.info.name} is missing.`]
					}),
					React.createElement('br', {}),
					React.createElement('a', {
						target: '_blank',
						href: 'https://betterdiscord.app/Download?id=9',
						children: ['Click here to download the library!']
					})
				);
				if (!ModalStack || !ConfirmationModal) return BdApi.alert(title, children);
				ModalStack.push(function(props) {
					return React.createElement(ConfirmationModal, Object.assign({
						header: title,
						children: [
							React.createElement(TextElement, {
								color: TextElement.Colors.STANDARD,
								children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]
							})
						],
						red: false,
						confirmText: 'Download Now',
						cancelText: 'Cancel',
						onConfirm: () => {
							require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
								if (error) return require('electron').shell.openExternal('https://betterdiscord.app/Download?id=9');
								await new Promise((r) => require('fs').writeFile(require('path').join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, r));
							});
						}
					}, props));
				});
			}
			start() {
				log('started!');
			}
			stop() {
				log('stopped!');
			}
		}
		: buildPlugin(global.ZeresPluginLibrary.buildPlugin(config));
})();

module.exports = HideUtils;

/*@end@*/
