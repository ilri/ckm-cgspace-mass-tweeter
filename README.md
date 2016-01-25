# CGSpace Mass-Tweeter

A tool to mass-tweet CGSpace entries to twitter, also providing the status of each entry as being tweeted or not.

## Workflow

The following is an overview of how the application works:

1. A twitter user signs up on the system through OAuth.
2. The user is provided with a form to specify the service points of CGSpace (XML/JSON)
3. The app pulls data from CGSpace, only the title and the handle of each entry.
4. The user is presented with a list of entries and their status showing whether or not the entry has been tweeted or not.
5. The user selects the entries from the list and tweets them.
6. The system receives the status of each tweet and updates it. (Also checks if the limit to the number of tweets has not been exceeded)

## More Information

Please visit the [wiki](https://github.com/tsega/ckm-cgspace-mass-tweeter/wiki) for this repository to know more about the system.

# License

This project is licensed under the [GNU General Public License Version 3 (GPL v3)](license.md).
