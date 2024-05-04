# Example
./gradlew fatJar -PmainClass=com.net128.app.test.threed.SpinningCube
sdk use java 11.0.23.fx-librca
java \
	--add-exports java.base/java.lang=ALL-UNNAMED \
	--add-exports java.desktop/sun.awt=ALL-UNNAMED \
	--add-exports java.desktop/sun.java2d=ALL-UNNAMED \
	-Djava.library.path=libs -jar build/libs/SpinningCube-1.0-SNAPSHOT.jar

# Other apps
JavaModelObjLoaderApp


# Links
- JavaFX 3D: https://www.youtube.com/watch?v=oaL8n1bmD78
  Source: https://github.com/AlmasB/javafx3d-samples
- https://github.com/armin-reichert/pacman-javafx
- https://github.com/justinyaodu/javafx-fractal-raytracer