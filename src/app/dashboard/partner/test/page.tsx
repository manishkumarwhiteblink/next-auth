import {getServerJWT} from "@/lib/jwt-utils";

export default async function Test(){
    const jwt = await getServerJWT();
    console.log('jwt', jwt);
    return<>hii
    </>
}