// @ts-check
import './App.css';
import 'react-chat-widget/lib/styles.css';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
// @ts-ignore
import { Widget, addResponseMessage, toggleMsgLoader, addUserMessage, toggleInputDisabled, handleQuickButtonClicked, setQuickButtons } from 'react-chat-widget';

import { USER_UUID_LOCALSTORAGE } from './Constants';
import { generateUUIDv4 } from './utils/SocketUtils';
import { CustomLauncher } from './components/CustomLauncher';
import { RESPONSE_TYPE_TEXT, RESPONSE_TYPE_OPTION, RESPONSE_TYPE_TYPING, RESPONSE_TYPE_PAUSE } from './utils/WatsonConstants';

/**
 * @typedef {Object} GenericMessage
 * @property {!string} response_type
 * @property {?string| ?[]} text
 * @property {?array} options
 * @property {?number} time
 * @property {?boolean} typing
 *
 * @typedef {Object} QuickButton
 * @property {string} value
 * @property {string} label
 * @class App
 */
class App extends Component {
    static propTypes = {
        href: PropTypes.string,
    };

    constructor(props) {
        super(props);
        const uuid = this.checkUserIdentity();

        this.state = {
            user: {
                uuid,
            },
            chat: {
                isOpen: false,
                isEnabled: false,
                isTyping: false,
            },
        };
    }

    checkUserIdentity() {
        let userUUID = localStorage.getItem(USER_UUID_LOCALSTORAGE);
        if (!userUUID) {
            userUUID = generateUUIDv4();
            localStorage.setItem(USER_UUID_LOCALSTORAGE, userUUID);
        }
        return userUUID;
    }

    connectWebsocket() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Websocket not closed');
            return;
        }
        console.log('Creating new websocket connection');
        this.socket = new WebSocket('ws://' + this.props.href );

        this.socket.onopen = () => {
            console.log('websocket open.');
            //send Connect Hello event
            // or welcome_back event if the user was on this website before
            const helloRequest = {
                type: 'hello',
                user: this.state.user.uuid,
                channel: 'socket',
            };

            this.socket.send(JSON.stringify(helloRequest));
        };

        this.socket.onmessage = message => {
            if (message.data) {
                const payload = JSON.parse(message.data);
                console.log('OnMessage', payload);
                if (payload.type === 'message') {
                    if (payload.generic) {
                        this.handleGenericMessage(payload.generic);
                    }
                } else if (payload.type === RESPONSE_TYPE_TYPING) {
                    this.setTypingIndicator(true);
                }
            }
        };
        this.socket.onclose = () => {
            setTimeout(() => {
                this.connectWebsocket();
            }, Math.random() * 5000);
        };
    }

    componentWillUnmount() {
        this.socket.close();
    }

    /**
     * Handles click on quick response button in chat
     *
     * @param {QuickButton} button
     */
    handleQuickButtonClick = button => {
        const message = {
            type: 'quickresponse',
            value: button.value,
            user: this.state.user.uuid,
            channel: 'socket',
        };

        this.socket.send(JSON.stringify(message));
        addUserMessage(button.label);
    };

    /**
     *
     * @param {[GenericMessage]} genericMessage
     */
    handleGenericMessage(genericMessage) {
        genericMessage.reverse();

        /**
         * Recursive function to proccess array of messages. Need to be done with recursion because browsers do not implement async/await in for .. of
         * Need to wait when pause event is received.
         * @param {[GenericMessage]} messegesQueue Array of generic messages reversed to be used as a queue
         */
        const handle = async messegesQueue => {
            if (messegesQueue.length > 0) {
                const messegeToProcces = messegesQueue.pop();
                await this.processMessage(messegeToProcces);
                handle(messegesQueue);
            } else {
                return;
            }
        };
        handle(genericMessage);
    }

    /**
     * Process message from server according to its type.
     *
     *  @param {GenericMessage} message
     * **/
    processMessage(message) {
        console.log('message: ', message);
        switch (message.response_type) {
            case RESPONSE_TYPE_TEXT:
                this.setTypingIndicator(false);
                if (message.text && message.text instanceof Array) {
                    message.text.forEach(textReply => {
                        addResponseMessage(textReply);
                    });
                } else if (message.text) {
                    addResponseMessage(message.text);
                }
                break;
            case RESPONSE_TYPE_OPTION:
                const quickOptionsArray = message.options.map(optionItem => {
                    return {
                        label: optionItem.label,
                        value: optionItem.value.input.text,
                    };
                });
                setQuickButtons(quickOptionsArray);
                break;
            case RESPONSE_TYPE_PAUSE:
                this.setTypingIndicator(message.typing);
                return new Promise(resolve => {
                    setTimeout(resolve, message.time);
                });

            default:
                console.log('Unknown message type.', message.response_type);
        }
    }
/** @function */
    handleNewUserMessage = newMessage => {
        const message = {
            type: 'message',
            text: newMessage,
            user: this.state.user.uuid,
        };
        this.socket.send(JSON.stringify(message));
    };
/** @function */
    launcherCustom = handleToggle => {
        return <CustomLauncher onClick={this.launcherToggleHandle(handleToggle)} isChatOpen={this.state.chat.isOpen} />;
    };

    setTypingIndicator(isTyping) {
        if (isTyping) {
            if (!this.state.chat.isTyping) {
                toggleMsgLoader();
                this.setState({
                    chat: {
                        ...this.state.chat,
                        isTyping: true,
                    },
                });
            }
        } else {
            if (this.state.chat.isTyping) {
                toggleMsgLoader();
                this.setState({
                    chat: {
                        ...this.state.chat,
                        isTyping: false,
                    },
                });
            }
        }
    }

    /**
     * Handler for opening chat widnow.
     * @function
     * @param {function} handleToggle handleToggle function from Widget component for opening and closing chat window
     */
    launcherToggleHandle = handleToggle => {
        return () => {
            this.setState({
                chat: {
                    ...this.state.chat,
                    isOpen: !this.state.chat.isOpen,
                },
            });
            this.connectWebsocket();
            handleToggle();
        };
    };

    render() {
        return (
            <div className="App">
                <Widget
                    title="Obec Lhota"
                    subtitle="CzechBot"
                    profileAvatar="icons8-bot-48.png"
                    handleNewUserMessage={this.handleNewUserMessage}
                    handleQuickButtonClicked={this.handleQuickButtonClick}
                    launcher={this.launcherCustom}
                />
            </div>
        );
    }
}

export default App;
