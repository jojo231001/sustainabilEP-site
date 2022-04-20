import { useEffect, useRef, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useSelector } from 'react-redux'
import { inIframe } from 'Source/utils'

// We let iframe integrators ask the user if he wants to share its simulation data to the parent window
const shareDataPopupTimeout = 3500

export default ({ data }) => {
	var [isOpen, setIsOpen] = useState(false)
	//To delay the dialog show in to let the animation play
	const timeoutRef = useRef(null)
	const iframeOptions = useSelector((state) => state.iframeOptions)

	useEffect(() => {
		if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => {
			timeoutRef.current = null
			setIsOpen(true)
		}, shareDataPopupTimeout)
	}, [])
	function onReject() {
		window.parent.postMessage(
			{
				messageType: 'ngc-iframe-share',
				error: 'The user refused to share his result.',
			},
			'*'
		)
		setIsOpen(false)
	}
	function onAccept() {
		window.parent.postMessage({ messageType: 'ngc-iframe-share', data }, '*')
		setIsOpen(false)
	}
	function onClose() {
		setIsOpen(false)
	}
	if (!inIframe() || !document.referrer || !iframeOptions?.iframeShareData)
		return null
	const parent = document.referrer
		? new URL(document.referrer).hostname
		: 'parent'
	const text = (
		<div>
			<p>
				En cliquant sur le bouton Accepter, vous nous autorisez à communiquer le
				résumé de votre test d'empreinte climat au site {parent}.
			</p>
			<p>
				Il s'agit de vos résultats sur les grandes catégories (transport,
				alimentation...), mais <em>pas</em> le détail question par question (vos
				km en voiture, les m² de votre logement...).
			</p>
			<p>Nosgestesclimat.fr n'est pas affilié au site {parent}.</p>
		</div>
	)

	if (!isOpen) return null
	return (
		<div
			css={`
				position: absolute;
				z-index: 10;
				border-radius: 1rem;
				margin-top: 10%;
				filter: drop-shadow(0 0 20px #000);
				box-shadow: 0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
					0.4px 0.8px 1px -1.2px hsl(var(--shadow-color) / 0.34),
					1px 2px 2.5px -2.5px hsl(var(--shadow-color) / 0.34);
				--shadow-color: 0deg 0% 63%;

				padding: 1rem;
				text-align: center;
				background: #fff;
			`}
		>
			<h2>Partage de vos résultats à {parent} ?</h2>
			<p>{text}</p>
			<div
				css={`
					display: flex;
					justify-content: space-evenly;
					padding: 1rem;
				`}
			>
				<button onClick={onAccept} className="ui__ plain button">
					{emoji('👍')} Accepter
				</button>
				<button onClick={onReject} className="ui__ button ">
					{emoji('👎')} refuser
				</button>
			</div>
		</div>
	)
}