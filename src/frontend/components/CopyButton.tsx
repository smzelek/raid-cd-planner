import React, { ReactNode, useState } from "react";

export default function CopyButton(props: { onClick: () => void, children: ReactNode }) {
    const [showCopyAlert, setShowCopyAlert] = useState(false);
    const [copyTimer, setCopyTimer] = useState<NodeJS.Timeout | null>(null);

    return <button
        className='primary-btn'
        onClick={() => {
            props.onClick();
            setShowCopyAlert(true);
            copyTimer && clearTimeout(copyTimer);

            setCopyTimer(setTimeout(() => {
                setShowCopyAlert(false);
            }, 500));
        }}
        style={{
            display: 'grid',
            cursor: showCopyAlert ? 'not-allowed' : 'pointer'
        }}
    >
        <span style={{ gridArea: '1 / 1 / 1 / 1', visibility: (showCopyAlert ? 'visible' : 'hidden') }}>Copied!</span>
        <span style={{ gridArea: '1 / 1 / 1 / 1', visibility: (!showCopyAlert ? 'visible' : 'hidden') }}>{props.children}</span>
    </button>
}