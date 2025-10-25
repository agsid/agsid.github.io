export const pageContent = {
  'what-is-it': {
    title: 'Allied Work',
    paragraphs: [
      `Allied Work allows users to see where their robots will go on the game mat with the built-in visualizer. This is very helpful because many times teams are using trial and error to reach their desired location on the game mat. Not only can teams do this, but they can also code with ease. The Allied Workspace allows users to code in its native language called Allied Work. Allied Work is made to be simple so everybody can code their robot. When you are done coding your path, you can press the run button to see the path of the robot, then copy the Python code from the built-in Python generator.`,
    ],
  },
  'autocorrection': {
    title: 'Allied AutoCorrection',
    style: 'color: purple;',
    paragraphs: [
      `Allied AutoCorrection is a beautiful and helpful function for all FLL teams. The function provides precision in all aspects. Imagine you are walking straight and you trip. Now you will get back in the same line you were walking in, and walk until you reach your final destination. Allied AutoCorrection is here to help the robot do the same. One of the sensors used is the gyro sensor. A gyro sensor helps track the robot's position in a graph. The gyro sensor helps with the x, y, and z plane. This helps us to see if the robot has encountered an error.`,
    ],
  },
  'related': {
    title: 'How they are related',
    paragraphs: [
      `You may be asking how an autocorrection software and an auto correction function are related. Well, in the Allied Work editor whenever you code a command for movement such as \`drive\`, it takes the Allied AutoCorrection function and uses it to give accurate movements.`,
    ],
  },
  'AACWork': {
    title: 'How Does Allied AutoCorrection Work?',
    paragraphs: [
      `Allied AutoCorrection works by continuously monitoring the robot's orientation and position using sensors, primarily the gyro sensor. If the robot deviates from its intended path or heading, the system automatically calculates the necessary corrections and adjusts the motor outputs to bring the robot back on track. This real-time feedback loop ensures that the robot maintains precision throughout its movement commands, compensating for external disturbances or inherent mechanical inaccuracies. This makes the robot's movements much more reliable and repeatable in a competitive environment.`,
      `Beyond the gyro sensor, Allied AutoCorrection can integrate data from other sensors like encoders on wheels to measure distance traveled, or even color sensors to detect lines on the game mat. By combining these sensor inputs, the system creates a more comprehensive understanding of the robot's state and environment. This multi-sensor fusion allows for more accurate deviation detection and more precise corrective actions.`,
      `The core of the auto-correction mechanism involves a PID (Proportional-Integral-Derivative) controller, or a similar control loop. This controller takes the error (the difference between the desired state and the actual state) and calculates an output to minimize that error. For instance, if the robot drifts slightly to the left, the controller would slightly increase the power to the right motor and decrease power to the left motor until the robot is back on its intended heading. The tuning of these control parameters is crucial for smooth and stable correction.`,
    ],
  },
  'benefits': {
    title: 'Benefits & Impact',
    paragraphs: [
      `The combination of Allied Work's intuitive coding environment and Allied AutoCorrection's precision offers significant benefits to FLL teams. Firstly, it drastically reduces the learning curve for new team members, enabling them to contribute to robot programming much faster. The visualizer provides immediate feedback, transforming abstract code into tangible robot movements, which is invaluable for debugging and understanding complex paths.`,
      `Secondly, and perhaps most critically, Allied AutoCorrection empowers teams to achieve higher scores in competitions. By ensuring consistent and accurate robot movements, it minimizes errors that often lead to missed mission objectives. This increased reliability allows teams to focus on refining their strategies and attempting more challenging tasks, rather than constantly troubleshooting basic movement issues. Ultimately, Allied Work fosters a more efficient, engaging, and successful robotics experience for students.`,
    ],
  },
  'additional': {
    title: 'Additional Considerations',
    paragraphs: [
      `When implementing complex robot movements, integrating features like Allied AutoCorrection is crucial for consistent performance. Without it, minor errors can accumulate, leading to significant deviations from the desired path. The visualizer in Allied Work provides an immediate feedback loop for developers, allowing them to quickly identify and rectify any issues before deploying code to the physical robot. This significantly reduces the time spent on trial and error and improves overall development efficiency. Consider incorporating odometry for even greater accuracy.`,
    ],
  },
  'future-enhancements': {
    title: 'Future Enhancements',
    paragraphs: [
      `Future enhancements for Allied Work could include more advanced path planning algorithms, integration with vision systems for object recognition and avoidance, and machine learning capabilities to optimize movement patterns over time. Imagine a robot that learns from its past runs and automatically refines its auto-correction parameters for even greater precision. These advancements would push the boundaries of what FLL teams can achieve with their robots.`,
    ],
  },
  'community': {
    title: 'Community and Support',
    paragraphs: [
      `Building a strong community around Allied Work is essential. Providing forums, tutorials, and examples would empower users to get the most out of the platform. Sharing best practices for implementing Allied AutoCorrection in different scenarios could further enhance its utility. A dedicated support channel would ensure that teams receive timely assistance with any challenges they encounter, fostering a collaborative environment for innovation in robotics education.`,
    ],
  },
};