package com.net128.app.test.threed;

import com.sun.j3d.utils.geometry.*;
import com.sun.j3d.utils.universe.*;
import javax.media.j3d.*;

/**
 * An application that displays an animated cube in Java3D
 *
 * Note:  Under MS-Windows with Direct3D this application
 * must be run as follows:
 *
 *   java -Dj3d.rend=d3d AnimationDriver
 *
 * because OpenGL is the default rendering technology (and some
 * MS-Windows installations do not support OpenGL)
 *
 * @author  Prof. David Bernstein, James Madison University
 * @version 1.0
 */
public class AnimationDriver
{
    /**
     * The entry-point of the application
     *
     * @param args  The command line arguments
     */
    public static void main(String[] args)
    {
       Alpha                    alpha;       
       ApplicationWindow3D      window;
       BoundingSphere           bounds;       
       BranchGroup              scene;
       ColorCube                cube;       
       RotationInterpolator     rotator;       
       SimpleUniverse           universe;
       TransformGroup           transformGroup;
       
       
       window   = new ApplicationWindow3D();
       universe = window.getSimpleUniverse();
       scene = new BranchGroup();


       // Create a TransformGroup
       transformGroup = new TransformGroup();
       transformGroup.setCapability(TransformGroup.ALLOW_TRANSFORM_WRITE);

       // Add the TransformGroup to the scene
       scene.addChild(transformGroup);

       // Create a ColorCube
       cube = new ColorCube(0.4);       

       // Add the ColorCube to the TransformGroup
       transformGroup.addChild(cube);

       // Create time varying function to drive the animation
       alpha = new Alpha(-1, 4000);

       // Create a new Behavior object that performs the rotation
       rotator = new RotationInterpolator(alpha, transformGroup);

       // Bound the active region
       bounds = new BoundingSphere();
       rotator.setSchedulingBounds(bounds);

       // Add the Behavior to the scene
       transformGroup.addChild(rotator);

       scene.compile();
       universe.addBranchGraph(scene);
    }
}
