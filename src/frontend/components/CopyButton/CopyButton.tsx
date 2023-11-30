import React, { ReactNode, useState } from "react";

export default function CopyButton(props: { onClick: () => void, children: ReactNode }) {
    const [copy, setCopy] = useState(false);
    const [copyTimer, setCopyTimer] = useState<NodeJS.Timeout | null>(null);

    return <button onClick={() => {
        props.onClick();
        setCopy(true);
        copyTimer && clearTimeout(copyTimer);

        setCopyTimer(setTimeout(() => {
            setCopy(false);
        }, 500));
    }} style={{ display: 'grid' }}>
        <span style={{ gridArea: '1 / 1 / 1 / 1', visibility: (copy ? 'visible' : 'hidden') }}>Copied!</span>
        <span style={{ gridArea: '1 / 1 / 1 / 1', visibility: (!copy ? 'visible' : 'hidden') }}>{props.children}</span>
    </button>
}