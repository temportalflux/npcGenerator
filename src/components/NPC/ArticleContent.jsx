import React from 'react';
import NpcData from '../../storage/NpcData';
import lodash from 'lodash';
import { Header, Button, List, Popup, Table, Grid, Divider } from 'semantic-ui-react';
import * as shortid from 'shortid';

function toFeet(n)
{
	const realFeet = ((n * 0.393700) / 12);
	const feet = Math.floor(realFeet);
	const inches = Math.floor((realFeet - feet) * 12);
	return feet + "'" + inches + '"';
}

function toSentenceCase(sentence)
{
	return sentence.length <= 0 ? '' : (
		sentence[0].toUpperCase() + sentence.slice(1)
	);
}

function getRenderedText(text, entry)
{
	if (typeof text === 'function')
	{
		return text(entry);
	}
	else if (text !== undefined)
	{
		return text;
	}
	else
	{
		return entry.toString();
	}
}

function InlineEntryItem({
	entry, rerollAs, globalData, text,
})
{
	const refresh = React.useState(undefined)[1];
	React.useEffect(() => {
		function onChanged(evt) { refresh(shortid.generate()); }
		entry.addListenerOnChanged(onChanged);
		entry.addListenerOnUpdateString(onChanged);
		entry.addListenerOnModified(onChanged);
		entry.addListenerOnUpdateCollection(onChanged);
		return () => {
			entry.removeListenerOnChanged(onChanged)
			entry.removeListenerOnUpdateString(onChanged);
			entry.removeListenerOnModified(onChanged);
			entry.removeListenerOnUpdateCollection(onChanged);
		};
	});
	const renderedText = getRenderedText(text, entry);
	return (
		<Popup
			hoverable={true}
			trigger={(<span style={{
				color: "#4400ff",
				fontWeight: 'bold'
			}}>{renderedText}</span>)}
			content={(
				<span>
					<Button
						path={rerollAs || entry.getKeyPath()} size='mini' icon='refresh'
						onClick={() => {
							entry.regenerate(globalData);
							entry.npc.save();
						}}
					/>
					<label>{entry.getName()}: {renderedText}</label>
				</span>
			)}
		/>
	);
}

export function ArticleContent({ usePlainText })
{
	const npc = NpcData.get();
	const globalData = npc.getModifiedData();

	
	const createEntryItem = (entry, text=undefined, rerollAs=undefined) =>
	{
		if (!entry) { return <div />; }
		if (usePlainText || !entry.getCanReroll())
		{
			return getRenderedText(text, entry);
		}
		return (
			<InlineEntryItem
				entry={entry}
				rerollAs={rerollAs}
				globalData={globalData}
				text={text}
			/>
		);
	}
	
	const strength = npc.getEntry('stats.abilityScores.strength');
	const dexterity = npc.getEntry('stats.abilityScores.dexterity');
	const constitution = npc.getEntry('stats.abilityScores.constitution');
	const intelligence = npc.getEntry('stats.abilityScores.intelligence');
	const wisdom = npc.getEntry('stats.abilityScores.wisdom');
	const charisma = npc.getEntry('stats.abilityScores.charisma');
	const ethicalPositive = npc.getEntry('stats.alignmentTendancies.ethical.positive');
	const ethicalNeutral = npc.getEntry('stats.alignmentTendancies.ethical.neutral');
	const ethicalNegative = npc.getEntry('stats.alignmentTendancies.ethical.negative');
	const moralPositive = npc.getEntry('stats.alignmentTendancies.moral.positive');
	const moralNeutral = npc.getEntry('stats.alignmentTendancies.moral.neutral');
	const moralNegative = npc.getEntry('stats.alignmentTendancies.moral.negative');

	const name = npc.getEntry('identity.name');
	const surname = npc.getEntry('identity.surname');
	const pronouns = npc.getEntry('identity.pronouns');
	const genderIdentity = npc.getEntry('identity.genderIdentity');
	const genderExpression = npc.getEntry('identity.genderExpression');
	const sex = npc.getEntry('identity.sex');
	const romanticIdentity = npc.getEntry('identity.romanticIdentity');
	const sexualIdentity = npc.getEntry('identity.sexualIdentity');
	const sexualOrientation = npc.getEntry('identity.sexualOrientation');

	const profession = npc.getEntry('occupation.profession');

	const age = npc.getEntry('description.age');
	const eyeColor = npc.getEntry('description.eyeColor');
	const height = npc.getEntry('description.height');
	const weight = npc.getEntry('description.weight');
	const face = npc.getEntry('description.face');
	const race = npc.getEntry('description.race');
	const hair = npc.getEntry('description.race.hair');
	const skin = npc.getEntry('description.race.skin');

	const physicalTraitsMap = npc.getEntry('description.specialPhysical').getChildren();
	const physicalTraits = lodash.values(physicalTraitsMap).map((entry) => (
		<List.Item key={entry.getKeyPath()} as='li'>
			{createEntryItem(entry, (e) => toSentenceCase(e.toString()))}
		</List.Item>
	));

	const deity = npc.getEntry('personality.religion.deity');
	const worship = npc.getEntry('personality.religion.worship');
	const quirks = npc.getEntry('personality.quirks');
	const quirkList = quirks.getCollectionEntryKeys()
		.map((entryKey) => npc.getEntry(entryKey))
		.filter((entry) => !entry.isValueEquivalentToNone())
		.map((entry) => (
			<List.Item key={entry.getKeyPath()} as='li'>
				{createEntryItem(entry, (e) => toSentenceCase(e.toString()))}
			</List.Item>
		));

	return (
		<div>
			{usePlainText && (
				<p>View generation at <a href={NpcData.getLink()}>D&amp;D-Generator</a></p>
			)}

			<Header as='h1' content='Description' />
			<List bulleted as='ul'>
				<List.Item as='li'>
					{createEntryItem(name)}{surname.hasValue() && createEntryItem(surname, (e) => ` ${e.toString()}`)}
					&nbsp; is a &nbsp;
					{createEntryItem(age)} year old &nbsp;
					{createEntryItem(genderIdentity)} &nbsp;
					{createEntryItem(race)} &nbsp;
					{createEntryItem(profession, undefined, 'occupation.type')}.
				</List.Item>
				<List.Item as='li'>
					{toSentenceCase(pronouns.getRawValue().singular)}
					&nbsp; has &nbsp;
					{createEntryItem(eyeColor, (e) => `${e.toString()} eyes`)}
					&nbsp; and &nbsp;
					{createEntryItem(hair)}.
				</List.Item>
				<List.Item as='li'>
					{toSentenceCase(pronouns.getRawValue().singular)}
					&nbsp; has &nbsp;
					{createEntryItem(skin)}.
				</List.Item>
				<List.Item as='li'>
					{toSentenceCase(pronouns.getRawValue().singular)}
					&nbsp; stands &nbsp;
					{createEntryItem(height, (e) => `${e.toString()}cm (${toFeet(e.getModifiedValue())})`)}
					&nbsp; tall and has a &nbsp;
					{createEntryItem(weight)} build.
				</List.Item>
				<List.Item as='li'>
					{toSentenceCase(pronouns.getRawValue().singular)}
					&nbsp; has an &nbsp;
					{createEntryItem(face)} face.
				</List.Item>
				{physicalTraits}
			</List>

			<Header as='h1' content='Identity' />
			<Table compact='very' size='small' striped textAlign='center'>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Pronouns</Table.Cell>
						<Table.Cell>{createEntryItem(pronouns)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Gender Identity</Table.Cell>
						<Table.Cell>{createEntryItem(genderIdentity)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Gender Expression</Table.Cell>
						<Table.Cell>{createEntryItem(genderExpression)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Sex</Table.Cell>
						<Table.Cell>{createEntryItem(sex)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Romantic Identity</Table.Cell>
						<Table.Cell>{createEntryItem(romanticIdentity)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Sexual Identity</Table.Cell>
						<Table.Cell>{createEntryItem(sexualIdentity)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Sexual Orientation</Table.Cell>
						<Table.Cell>{createEntryItem(sexualOrientation)}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>

			<Header as='h1' content='Personality' />
			<List bulleted as='ul'>
				<List.Item as='li'>
					{toSentenceCase(pronouns.getRawValue().singular)}
					&nbsp; {createEntryItem(worship)} worships {createEntryItem(deity)}.
				</List.Item>
				{quirkList}
			</List>

			<Header as='h1' content='Stats' />

			<Header as='h2' content='Ability Scores' />
			<Table striped textAlign='center'>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Strength</Table.Cell>
						<Table.Cell>{strength.toString()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Dexterity</Table.Cell>
						<Table.Cell>{dexterity.toString()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Constitution</Table.Cell>
						<Table.Cell>{constitution.toString()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Intelligence</Table.Cell>
						<Table.Cell>{intelligence.toString()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Wisdom</Table.Cell>
						<Table.Cell>{wisdom.toString()}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Charisma</Table.Cell>
						<Table.Cell>{charisma.toString()}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
			
			<Header as='h2' content='Alignment Tendencies' />
			<Header as='h3' content='Ethical' />
			<Table compact='very' size='small' striped textAlign='center'>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Lawful</Table.Cell>
						<Table.Cell>{createEntryItem(ethicalPositive)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Neutral</Table.Cell>
						<Table.Cell>{createEntryItem(ethicalNeutral)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Chaotic</Table.Cell>
						<Table.Cell>{createEntryItem(ethicalNegative)}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
			<Header as='h3' content='Moral' />
			<Table compact='very' size='small' striped textAlign='center'>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Good</Table.Cell>
						<Table.Cell>{createEntryItem(moralPositive)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Neutral</Table.Cell>
						<Table.Cell>{createEntryItem(moralNeutral)}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Evil</Table.Cell>
						<Table.Cell>{createEntryItem(moralNegative)}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>

			{/*<Header as='h1' content='Plot Hook' />*/}

		</div>
	);
}