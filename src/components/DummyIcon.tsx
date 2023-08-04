export default function DummyIcon(props: { sizeClass: 'iconsmall' | 'iconmedium' }) {
    return (<a>
        <span className={props.sizeClass}>
            <ins style={{ backgroundImage: 'url("https://wow.zamimg.com/images/wow/icons/large/inv_helm_laughingskull_01.jpg")' }}>
            </ins>
            <del></del>
        </span>
    </a>)
}