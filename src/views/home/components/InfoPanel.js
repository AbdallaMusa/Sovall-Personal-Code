import { useLocation } from 'react-router-dom';
import profile from '../../../assets/common/profile.jpg';
import network from '../../../assets/home/network.svg';
import edit from '../../../assets/home/edit.svg';
import messages from '../../../assets/home/messages.svg';
import friends from '../../../assets/home/friends.svg';
import arrow_up from '../../../assets/home/arrow_up.svg';
import { useState, useEffect, useContext } from 'react';
import {getDownloadURL, ref} from 'firebase/storage'
import { doc, getDoc } from "firebase/firestore";
import AuthContext from "../../../contexts/auth-context";
import {db, storage} from '../../../firebase-config'
import Loader from '../../loader/Loader';
import LearnMore from './LearnMore'; 
import giga from '../../../assets/common/giga_learnmore.svg';


const QuickAccess = (props) => {
    return (
        <a href={props.href} className="flex flex-col h-[1.25rem]">
            <img className="h-full" src={props.src} />
            <label className="text-[8pt]">{props.label}</label>
        </a>
    );
}
const Label = (props) => {
    const bg = props.bg;
    const tc = props.textColor
    return <label className={"rounded-xl px-[0.5rem] py-[0.25rem] text-[8pt] " + bg + " " + tc} >{props.value}</label>
}
const InfoBlock = (props) => {
    return (
        <div className="w-full flex flex-col gap-[0.5rem]">
            <h1 className="font-bold text-[11pt]">{props.title}</h1>
            <div className="flex flex-wrap gap-[0.25rem]">
                {props.children}
            </div>
        </div>
    );

}

const Own = () => {
    return (
        <div className="flex gap-[0.5rem] text-gray-500" >
            <QuickAccess label="network" src={network} href="/search/people" />
            <QuickAccess label="edit profile" src={edit} href="/edit-profile" />
        </div>
    )
}

const Other = () => {
    return (
        <div className="relative flex gap-[0.5rem] text-gray-500 right-0" >
            <QuickAccess label="network" src={network} href="/home" />

            {/* Commented out for now since we haven't implemented them yet */}

            {/* <QuickAccess label="edit profile" src={messages} href="/home" />
            <QuickAccess label="edit profile" src={friends} href="/home" /> */}
        </div >
    )
}

const InfoPanel = (props) => {
    const [showDetails, setShowDetails] = useState(true);
    const [userInfo, setUserInfo] = useState({});
    const [username, setUserName] = useState('');
    const [profilePicPath, setProfilePicPath] = useState('');    
    const [isLoading, setIsLoading] = useState(true);

    const handleClick = () => {
        setShowDetails(prev => !prev);
    }
    useEffect(()=>{
        setIsLoading(true);
        const getUserInfo = async () =>{
            const response = await getDoc(doc(db, "users", props.user_id))
            const data = response.data(); 
            setUserInfo(response.data())
            const timestamp = new Date().getTime();
            setUserName(data.firstname + ' ' + data.lastname);
            // Get the download url for the profile pic
            const imageRef = ref(storage, data.image_path)
            try{
                const downloadURL = await getDownloadURL(imageRef)
                setProfilePicPath(`${downloadURL}?t=${timestamp}`);
            } catch(e){
                console.log(e);
            }
        } 
        getUserInfo();
        setIsLoading(false);
    }, [])

     /* To make sure to render the skills component only when the request is complete
        Check if array of interests is empty and if so, sets it to null
    */
    const skills = userInfo.skills && Array.isArray(userInfo.skills) ? userInfo.skills.map((skill,i) => {
        return <Label key={"info-skill-"+i}  value={skill} bg="bg-green-4" textColor="text-white"/>
    }) : null

    const interests = userInfo.interests && Array.isArray(userInfo.interests) ? userInfo.interests.map((interest,i) => {
        return <Label key={"info-interest-" + i}  value={interest} bg="bg-yellow-4" textColor="text-black"/>
    }) : null;

    const [learnMore, setLearnMore] = useState(false);

    // To get the current path/route of an object
    const location = useLocation();

    return(
        <div>
            {isLoading ? (
                    <Loader/>
            ): (
                <div className={"bg-white h-fit px-[2rem] pt-14 pb-3 rounded-b-xl flex flex-col gap-7 transition duration-150 ease-in-out " + props.width}>
                    <div className="flex justify-between ">
                        <div className="flex gap-4">
                            <img className="w-[4rem] h-[4rem] rounded-full" src={profilePicPath} />
                            <div className="flex flex-col w-fit ">
                                <a href="/home" className="font-bold">{username}</a>
                                <a className="text-blue-500 text-[9pt]" href="/home">{userInfo.email}</a>
                                <p className="text-[9pt]">{userInfo?.university}</p>
                            </div>

                        </div>
                        {props.own? <Own/> : <Other/>}
                    </div>

                    <div className={showDetails? "flex flex-col w-full gap-[1.5rem]" : "hidden"}>
                        <InfoBlock title="Skills">{skills}</InfoBlock>
                        <InfoBlock title="Interest">{interests}</InfoBlock>
                    </div>

                    <div className="w-full flex justify-center ">
                        
                        <button className="w-fit flex flex-col justify-center items-center " onClick={handleClick}>
                            <p className={"text-[8pt] "+ (showDetails ? "order-last" : "")}>{(showDetails ? "Hide details" : "Show details")}</p>
                            <img className={"h-[0.5rem] w-fit " + (!showDetails ? "rotate-180" : "")} src={arrow_up} />
                        </button>
                    </div>
                    
                    <div className={showDetails? "relative": "hidden"}>
                        {location.pathname === "/" && (<LearnMore value={learnMore} setValue={setLearnMore} /> )}
                    </div>

                    {/* <img className="h-9 w-9" src={giga} /> */}
            </div>
            )}
        </div>
    )
    
}
export default InfoPanel;