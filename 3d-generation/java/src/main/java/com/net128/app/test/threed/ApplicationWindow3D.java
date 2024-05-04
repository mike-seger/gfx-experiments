package com.net128.app.test.threed;

import java.awt.*;
import java.awt.event.*;

import com.sun.j3d.utils.universe.*;

import javax.media.j3d.*;
import javax.swing.*;

/**
 * The "main" window for an application
 *
 * @author Prof. David Bernstein, James Madison University
 * @version 1.0
 */
public class ApplicationWindow3D extends JFrame
        implements WindowListener {
    private Canvas3D canvas3D;
    private SimpleUniverse simpleUniverse;


    /**
     * Default Constructor
     */
    public ApplicationWindow3D() {
        super();

        GraphicsConfiguration graphicsConfiguration;
        ImageIcon icon;
        JComponent contentPane;
        String lookAndFeel;
        ViewingPlatform view;


        try {
            lookAndFeel = UIManager.getSystemLookAndFeelClassName();
            UIManager.setLookAndFeel(lookAndFeel);
        } catch (Exception e) {
            // Use the default look and feel
        }


        icon = null;
        icon = new ImageIcon(icondata);
        setIconImage(icon.getImage());
        setSize(500, 500);
        setTitle("James Madison University");
        setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);
        contentPane = (JComponent) getContentPane();
        contentPane.setLayout(new BorderLayout());

        // Get a GraphicsConfiguration object that describes the
        // properties of the display/graphics card
        graphicsConfiguration = SimpleUniverse.getPreferredConfiguration();

        // Construct a 3D rendering engine
        canvas3D = new Canvas3D(graphicsConfiguration);

        // Construct a SimpleUniverse object that creates the
        // "view" side of the scene graph
        simpleUniverse = new SimpleUniverse(canvas3D);

        // Get the ViewingPlatform so that we can set the
        // properties of the "view" side of the scene graph
        view = simpleUniverse.getViewingPlatform();

        // Move the projection plane back along the z-axis
        // so that the x interval [-1, 1] can be completely seen
        view.setNominalViewingTransform();

        contentPane.add(canvas3D, BorderLayout.CENTER);
        addWindowListener(this);
        setVisible(true);
    }


    /**
     * Get the Canvas3D associated with this window
     *
     * @return The Canvas3D
     */
    public Canvas3D getCanvas3D() {
        return canvas3D;
    }


    /**
     * Get the SimpleUniverse associated with this window
     *
     * @return The SimpleUniverse
     */
    public SimpleUniverse getSimpleUniverse() {
        return simpleUniverse;
    }


    /**
     * Handle windowClosing events (required by WindowListener)
     *
     * @param evt The WindowEvent
     */
    public void windowClosing(WindowEvent evt) {
        int response;


        response = JOptionPane.showConfirmDialog(this,
                "Exit this application?",
                "Exit?",
                JOptionPane.YES_NO_OPTION);

        if (response == JOptionPane.YES_OPTION) {
            dispose();
            System.exit(0);
        }
    }


    /**
     * Handle other windowing events (required by WindowListener)
     *
     * @param evt The WindowEvent
     */
    public void windowOpened(WindowEvent evt) {
    }

    ;

    public void windowClosed(WindowEvent evt) {
    }

    ;

    public void windowIconified(WindowEvent evt) {
    }

    ;

    public void windowDeiconified(WindowEvent evt) {
    }

    ;

    public void windowActivated(WindowEvent evt) {
    }

    ;

    public void windowDeactivated(WindowEvent evt) {
    }

    ;


    // The icon
    public static byte[] icondata = {71,
            73,
            70,
            56,
            57,
            97,
            16,
            0,
            16,
            0,
            -77,
            0,
            0,
            100,
            2,
            4,
            -4,
            -50,
            100,
            52,
            -50,
            -4,
            -100,
            102,
            4,
            -4,
            -2,
            -4,
            100,
            50,
            52,
            -4,
            -50,
            -100,
            100,
            -50,
            -4,
            -100,
            102,
            52,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            -94,
            -8,
            -119,
            29,
            80,
            74,
            -25,
            97,
            -10,
            119,
            0,
            119,
            33,
            -7,
            4,
            0,
            0,
            0,
            0,
            0,
            44,
            0,
            0,
            0,
            0,
            16,
            0,
            16,
            0,
            3,
            4,
            89,
            80,
            -56,
            25,
            -86,
            61,
            51,
            -117,
            106,
            122,
            15,
            -102,
            20,
            120,
            68,
            73,
            -128,
            -38,
            104,
            32,
            70,
            48,
            12,
            106,
            -90,
            2,
            44,
            58,
            116,
            84,
            7,
            0,
            -73,
            -115,
            -117,
            6,
            -128,
            -128,
            -41,
            -110,
            -36,
            12,
            20,
            -31,
            -80,
            103,
            -4,
            9,
            6,
            5,
            -29,
            -47,
            -29,
            -124,
            62,
            93,
            6,
            83,
            -23,
            7,
            -123,
            17,
            93,
            -81,
            -40,
            -45,
            -5,
            -107,
            20,
            -114,
            -58,
            -128,
            -80,
            44,
            56,
            115,
            -107,
            108,
            55,
            -14,
            25,
            93,
            22,
            -37,
            104,
            -70,
            36,
            -114,
            -114,
            0,
            0,
            59};

}
                              