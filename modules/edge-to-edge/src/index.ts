import { requireNativeModule } from 'expo-modules-core';

const NativeModule = requireNativeModule('EdgeToEdgeModule');

export function enableEdgeToEdge(): void {
  NativeModule.enable();
}
