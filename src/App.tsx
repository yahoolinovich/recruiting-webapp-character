import { useState, useEffect } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts';
import type { Attributes } from './types';

function App() {
  
  const [attributes, setAttributes] = useState<Attributes>({
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  });

  function calculateModifier(value: number): number {
    return Math.floor((value - 10) / 2);
  }
  

  const [skillPoints, setSkillPoints] = useState<{ [key: string]: number }>({});
  const [remainingPoints, setRemainingPoints] = useState(10 + 4 * calculateModifier(attributes.Intelligence));


  function updateAttribute(name: keyof Attributes, change: number): void {
    setAttributes(function (currentAttributes) {
      const totalAttributes = Object.values(currentAttributes).reduce((sum,value) => sum + value, 0)

      const updatedAttributes = { ...currentAttributes };
      if (totalAttributes + change <= 70) 
      {
        updatedAttributes[name] = Math.max(0, currentAttributes[name] + change);
      }
      return updatedAttributes;
    });
  }
  
  useEffect(() => {
    const intelligenceModifier = calculateModifier(attributes.Intelligence);
    setRemainingPoints(10 + 4 * intelligenceModifier);
  }, 
  [attributes.Intelligence]);

  function updateSkillPoints(skill: string, change: number): void {
    if (remainingPoints - change >= 0) {
      setSkillPoints(function (currentSkillPoints) {
        const updatedSkillPoints = { ...currentSkillPoints };
        const currentPoints = currentSkillPoints[skill] || 0;
        updatedSkillPoints[skill] = currentPoints + change;
  
        return updatedSkillPoints;
      });
  
      setRemainingPoints(function (currentRemainingPoints) {
        return currentRemainingPoints - change;
      });
    }
  }


  const saveCharacter = async () => {
    const payload = { attributes, skillPoints };
    console.log('Saving Payload:', payload);
  
    try {
      const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/yahoolinovich/character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log('Save Response:', data);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };
  
  const loadCharacter = async () => {
    try {
      const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/yahoolinovich/character');
      const data = await response.json();
  
      console.log('Full Load Response:', data);
  
      const responseBody = data.body || data;
  
      if (responseBody.attributes) {
        setAttributes(responseBody.attributes);
        console.log('Updated Attributes:', responseBody.attributes);
      } else {
        console.warn('No attributes found in response');
      }
  
      if (responseBody.skillPoints) {
        setSkillPoints(responseBody.skillPoints);
        console.log('Updated Skill Points:', responseBody.skillPoints);
      } else {
        console.warn('No skill points found in response');
      }
  
    } catch (error) {
      console.error('Error loading character:', error);
    }
  };

  
  const totalAttributePoints = Object.values(attributes).reduce((sum, value) => sum + value, 0);
  const remainingAttributePoints = 70 - totalAttributePoints;

  const [selectedRequirements, setSelectedRequirements] = useState<string | null>(null);


  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>

      <div className="columns-container">
        {/* Attributes */}
        <section className="column attributes">
          <h2>Attributes</h2>
          <h3>Remaining Points: {remainingAttributePoints}</h3>
          {ATTRIBUTE_LIST.map(attr => (
            <div key={attr}>
              <p>{attr}: {attributes[attr as keyof Attributes]}</p>
              <button onClick={() => updateAttribute(attr as keyof Attributes, 1)}>+</button>
              <button onClick={() => updateAttribute(attr as keyof Attributes, -1)}>-</button>
            </div>
          ))}
        </section>

        {/* Classes */}
        <section className="column classes">
          <h2>Classes</h2>
        {Object.keys(CLASS_LIST).map((className) => {
          const classRequirements = CLASS_LIST[className as keyof typeof CLASS_LIST];
          const isEligible = ATTRIBUTE_LIST.every(
            (attr) => attributes[attr as keyof Attributes] >= classRequirements[attr as keyof Attributes]
          );

          return (
            <div
              key={className}
              className={`class-item ${isEligible ? 'eligible' : ''}`}
            >
              <h3>{className}</h3>
              <p>{isEligible ? 'Eligible' : 'Not Eligible'}</p>
              <button onClick={() => setSelectedRequirements(className)}>View Requirements</button>
            </div>
          );
        })}

        {/* Display Requirements */}
        {selectedRequirements && (
          <div className="requirements-popup">
            <h3>{selectedRequirements} Requirements</h3>
            <ul>
              {ATTRIBUTE_LIST.map((attr) => (
                <li key={attr}>
                  {attr}: {CLASS_LIST[selectedRequirements as keyof typeof CLASS_LIST][attr as keyof Attributes]}
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedRequirements(null)}>Close</button>
          </div>
        )}
        </section>




        {/* Skills */}
        <section className="column skills">
          <h2>Skills</h2>
          <h3>Available Skill Points: {remainingPoints}</h3>
          {SKILL_LIST.map(skill => (
            <div key={skill.name}>
              <p>{skill.name} ({skill.attributeModifier} Modifier: {calculateModifier(attributes[skill.attributeModifier as keyof Attributes])})</p>
              <button onClick={() => updateSkillPoints(skill.name, 1)}>+</button>
              <button onClick={() => updateSkillPoints(skill.name, -1)}>-</button>
              <p>Total: {(skillPoints[skill.name] || 0) + calculateModifier(attributes[skill.attributeModifier as keyof Attributes])}</p>
            </div>
          ))}
        </section>
      </div>

      <button onClick={saveCharacter}>Save Character</button>
      <button onClick={loadCharacter}>Load Character</button>
    </div>
  );
}

export default App;