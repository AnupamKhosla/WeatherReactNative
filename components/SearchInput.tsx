import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { RefObject } from 'react';

type SearchInputProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  blurTarget?: RefObject<View | null>;
};

export default function SearchInput({
  onSubmit,
  placeholder = '',
  blurTarget,
}: SearchInputProps) {
  const [text, setText] = useState('');

  const handleSubmitEditing = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={70}
        tint="dark"
        blurMethod="dimezisBlurViewSdk31Plus"
        blurReductionFactor={4}
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.sheen]} />
      <TextInput
        autoCorrect={false}
        value={text}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.55)"
        underlineColorAndroid="transparent"
        textAlign="center"
        returnKeyType="search"
        style={styles.textInput}
        clearButtonMode="always"
        onChangeText={setText}
        onSubmitEditing={handleSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    overflow: 'hidden',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  sheen: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
});
