import { StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';

export default function App() {
  const onContextCreate = (gl) => {
    console.log(gl);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.flush();
    gl.endFrameEXP();
  }

  return (
    <View style={styles.container}>
      <Text>!! If you see me, I didn't crash !!</Text>
      <GLView style={{width: 300, height: 300}} onContextCreate={onContextCreate}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
