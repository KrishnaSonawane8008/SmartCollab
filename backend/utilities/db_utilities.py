

def parse_access_token(access_token:str):
    """
    simple function to parse the access token string
    
        :param access_token: user's access_token
        :type access_token: str
        :return: returns user_id of the user who possesses the access_token
        :rtype: int
    """
    return int(access_token.split("_")[0])