import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom";
import { ChatLayout_Context } from "../../../../contexts/ChatLayout-context-provider";

function hslToRgb(h, s, l) {
    // Normalize h, s, l to 0-1 range
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Achromatic (gray)
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert to 0-255 range and return as array
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



const CommunityTab = ({communityId, communityName}) => {


    const [tab_hsl_color, setTabColor]=useState(null)
    const [tab_hsl_dim, setTabColorDim]=useState(null)

    const {CommunityChannelMap}=useContext(ChatLayout_Context);

    const url_params=useParams()
    const navigate=useNavigate()
    useEffect( ()=>{
        const hue=(Math.floor(Math.random()*360))%360
        setTabColor(`hsl(${hue},100%,65%)`)
        setTabColorDim(`hsl(${hue},100%,35%)`)
    }, [] )


    return (
    
        <div className={`
                w-full h-[45px] max-w-[100px]
                flex items-center justify-center
                has-[.tab-square:hover]:pl-[4px] has-[.tab-square:hover]:pr-[7px]
                ${url_params.communityId==communityId?
                    "pl-[4px] pr-[7px] bg-[#8c8c8c]":"pl-[7px] pr-[10px]"}
                transition-all duration-100
            `}
        >

            <div
                title={communityName}
                className={` w-full aspect-square select-none cursor-pointer
                flex flex-col items-center justify-center 
                tab-square
                group
                ${url_params.communityId==communityId?
                    "bg-[var(--bg-color-dim)] border-[0.15rem] border-[#ffffff] rounded-[0.4rem] transition-all duration-100"
                    :
                    "bg-[var(--bg-color)] hover:bg-[var(--bg-color-dim)]  rounded-[0.4rem]"}
                `}

                style={{
                "--bg-color": tab_hsl_color,
                "--bg-color-dim": tab_hsl_dim
                }}
                onClick={()=>{
                    if(url_params.communityId==communityId) return;
                    const channel_id=CommunityChannelMap[communityId]
                    navigate(`/chats/${communityId}/${channel_id?channel_id:""}`)
                }}
            >
                <div
                    className={` 
                    font-[Inter] font-[1000] 
                    min-h-0 min-w-0

                    ${url_params.communityId==communityId?
                        "text-[#ffffff] mt-[0.1rem] leading-[1.069rem] text-[1.6rem]"
                        :
                        "group-hover:text-white text-[#1c1b1b] mt-[0.1rem] leading-[1.069rem] text-[1.5rem]"}
                    `}
                >
                    {communityName[0]?.toUpperCase()}
                </div>
            </div>

        </div>

    )
}

export default CommunityTab
