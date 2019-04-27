import React from 'react';
import styles from './launcher.module.scss';
import { ReactComponent as ChatIcon } from '../../images/chat.svg';
import { ReactComponent as ChatIconClose } from '../../images/chat-close.svg';

export const CustomLauncher = ({ onClick, isChatOpen }) => {
    return (
        <div className={[styles.launcher, 'rcw-custom-launcher'].join(' ')}>
            <button
                aria-haspopup="true"
                aria-expanded={isChatOpen ? 'true' : 'false'}
                className={isChatOpen ? styles.buttonOpen : styles.buttonClose}
                onClick={onClick}
            >
                {isChatOpen ? (
                    <ChatIconClose className={styles.iconClose} />
                ) : (
                    <ChatIcon className={styles.iconOpen} />
                )}
            </button>
        </div>
    );
};
