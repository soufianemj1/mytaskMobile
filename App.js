import { StyleSheet, Text,Image, TextInput,View, KeyboardAvoidingView,Keyboard,Platform, TouchableOpacity } from "react-native";
import React,{useState,useRef,useEffect} from "react";
import Task from "./components/Task";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
async function schedulePushNotification(seconds) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your Task! 📬",
      body: "Are you done with your task?",
      data: { data: "goes here" },
    },
    trigger: { seconds: seconds },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export default function App() {
  // notif
  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);

    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const Tasks = [
      {
        title: "Notification",
        description: "Schedule a notification to be sent",
        wait: 5,
        checked: true,
      },
    ];
  
    const minutesToSeconds = (minutes) => {
      return minutes * 60;
    };
  
    const dateToSecondsFromNow = (minutes) => {
      const now = new Date();
      const then = new Date(now.getTime() + minutesToSeconds(minutes) * 1000);
      return then.getTime();
    };
  
    useEffect(() => {
     
        schedulePushNotification(5);
      
    }, []);
  
    useEffect(() => {
      registerForPushNotificationsAsync().then((token) =>
        setExpoPushToken(token)
      );
  
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });
  
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response);
        });
  
      return () => {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }, []);
  
    const handleAddTask = () => {
      Keyboard.dismiss();
      setTaskItems([...taskItems, task]);
      setTask(null);
    };
  
    const completeTask = (index) => {
      let itemsCopy = [...taskItems];
      itemsCopy.splice(index, 1);
      setTaskItems(itemsCopy);
    };
    
  

  // end notif
  
    return (
    <View style={styles.container}>

      {/* ------------------- Tasks ------------------- */}

      <View style={styles.tasksWrapper}>
       
        {/* <Text style={styles.title}>My Tasks</Text> */}
        <Image
        style={styles.image}
        source={require('./assets/landingimage.png')}
      />
        <View style={styles.items}>
          {taskItems.map((item, index) => (
             <TouchableOpacity onPress={()=>completeTask(index)} key={index}>
            <Task  text={item} index={index} />
            </TouchableOpacity>

          ))}
        </View>
      </View>

      {/* ------------------- add a task ------------------- */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.writeTaskWrapper}
      >
        <TextInput style={styles.input} placeholder={"Add a task"} value={task} onChangeText={text=> setTask(text)} />
        <TouchableOpacity onPress={()=>handleAddTask()}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "skyblue",
  },
  image: {
    
    marginLeft: 115,
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  items: {
    marginTop: 20,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    borderRadius: 60,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    width: 250,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  
});