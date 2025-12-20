// Bot Types and Interfaces (JSDoc annotations for JavaScript)

/**
 * @typedef {Object} BotMessage
 * @property {string} id
 * @property {string} text
 * @property {'user'|'bot'} sender
 * @property {Date} timestamp
 * @property {'text'|'image'|'file'|'suggestion'} [type]
 * @property {string[]} [suggestions]
 */

/**
 * @typedef {Object} BotConfig
 * @property {string} name
 * @property {string} [avatar]
 * @property {string} welcomeMessage
 * @property {string} placeholderText
 * @property {string} themeColor
 */

/**
 * @typedef {Object} BotState
 * @property {boolean} isOpen
 * @property {boolean} isMinimized
 * @property {BotMessage[]} messages
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} BotContextProps
 * @property {BotState} state
 * @property {(text: string) => void} sendMessage
 * @property {() => void} toggleBot
 * @property {() => void} minimizeBot
 * @property {() => void} clearMessages
 */

/**
 * @typedef {Object} BotServiceInterface
 * @property {(message: string) => Promise<BotMessage>} sendMessage
 * @property {() => Promise<BotMessage[]>} getInitialMessages
 * @property {(context?: string) => Promise<string[]>} getSuggestions
 */

// Export for module system
export {};
