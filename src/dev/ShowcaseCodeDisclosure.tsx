import { useState } from 'react';
import { Pressable, Text, View } from '../runtime/react-native-web';

interface ShowcaseCodeDisclosureProps {
  sectionId: string;
  code: string;
}

export function ShowcaseCodeDisclosure({ sectionId, code }: ShowcaseCodeDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const regionId = `${sectionId}-code-region`;

  return (
    <View className="cm-catalog__code-disclosure">
      <Pressable
        className="cm-catalog__code-toggle"
        aria-expanded={isOpen}
        aria-controls={regionId}
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <Text>{isOpen ? 'Hide code' : 'Show code'}</Text>
      </Pressable>
      {isOpen && (
        <View
          id={regionId}
          className="cm-catalog__code-region"
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          <View className="cm-catalog__code-block">
            <Text>{code}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
