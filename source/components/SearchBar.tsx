import highlightMatches from 'Components/highlightMatches'
import { utils } from 'publicodes'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Worker from 'worker-loader!./SearchBar.worker.js'
import { title } from './publicodesUtils'
import './SearchBar.css'

const worker = new Worker()

type SearchItem = {
	title: string
	dottedName: Object
	espace: Array<string>
}

type Matches = Array<{
	key: string
	value: string
	indices: Array<[number, number]>
}>

export default function SearchBar({}: SearchBarProps) {
	const rules = useSelector((state) => state.rules)
	const [input, setInput] = useState('')
	const [results, setResults] = useState<
		Array<{
			item: SearchItem
			matches: Matches
		}>
	>([])

	const rulesList = Object.entries(rules).map(([dottedName, value]) => ({
		...value,
		dottedName,
	}))
	const searchIndex: Array<SearchItem> = useMemo(
		() =>
			Object.values(rulesList)
				.filter(utils.ruleWithDedicatedDocumentationPage)
				.map((rule) => ({
					title: title(rule) + (rule.acronyme ? ` (${rule.acronyme})` : ''),
					dottedName: rule.dottedName,
					espace: rule.dottedName.split(' . ').reverse(),
				})),
		[rules]
	)
	useEffect(() => {
		worker.postMessage({
			rules: searchIndex,
		})

		worker.onmessage = ({ data: results }) => setResults(results)
		return () => {
			worker.onmessage = null
		}
	}, [searchIndex, setResults])

	const { t } = useTranslation()

	return (
		<>
			<label
				title={t('Entrez des mots clefs')}
				css={`
					margin: 0.6rem 0;
					display: flex;
					align-items: center;
					height: 2rem;
				`}
			>
				<img
					src="/images/1F50D.svg"
					width="100px"
					height="100px"
					css={`
						width: 3rem;
					`}
				/>
				<input
					autoFocus
					type="search"
					className="ui__"
					value={input}
					placeholder={t('Entrez des mots clefs ici')}
					onChange={(e) => {
						const input = e.target.value
						if (input.length > 0) worker.postMessage({ input })
						setInput(input)
					}}
				/>
			</label>
			{input.length > 2 && !results.length ? (
				<p
					role="status"
					className="ui__ notice light-bg"
					css={`
						padding: 0.4rem;
						border-radius: 0.3rem;
						margin-top: 0.6rem;
					`}
				>
					<Trans i18nKey="noresults">
						Aucun résultat ne correspond à cette recherche
					</Trans>
				</p>
			) : (
				input.length > 2 && (
					<ul
						css={`
							padding-left: 1rem;
							margin: 0;
							list-style: none;
							li {
								margin: 0.4rem 0;
								padding: 0.6rem 0.6rem;
								border-bottom: 1px solid var(--lighterColor);
							}
							small {
								display: block;
							}
						`}
					>
						{(!results.length && !input.length
							? searchIndex.map((item) => ({ item, matches: [] }))
							: results
						).map(({ item, matches }) => (
							<li key={item.dottedName}>
								<Link
									to={`/documentation/${utils.encodeRuleName(item.dottedName)}`}
								>
									<small>
										{item.espace
											.slice(1)
											.reverse()
											.map((name) => (
												<span key={name}>
													{highlightMatches(
														name,
														matches.filter(
															(m) => m.key === 'espace' && m.value === name
														)
													)}{' '}
													›{' '}
												</span>
											))}
										<br />
									</small>
									<span
										css={`
											margin-right: 0.6rem;
										`}
									>
										{rules[item.dottedName]?.icônes}
									</span>
									{highlightMatches(
										item.title,
										matches.filter((m) => m.key === 'title')
									)}
								</Link>
							</li>
						))}
					</ul>
				)
			)}
		</>
	)
}
