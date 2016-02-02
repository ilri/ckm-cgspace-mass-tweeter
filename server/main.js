Meteor.startup(function(){
    // Top-Level Communities of CGSPace
    var communities = [
        {
            name: "Africa RISING",
            hashtags: ["IITA", "ILRI"]
        },
        {
            name: "AgriFood Chain Toolkit",
            hashtags: ["agrifoodchain"]
        },
        {
            name: "Animal Genetic Resources Virtual Library",
            hashtags: ["ILRI", "genetics"]
        },
        {
            name: "Bioversity International",
            hashtags: ["BioversityInt", "CGIAR"]
        },
        {
            name: "Center for International Forestry Research (CIFOR)",
            hashtags: ["CIFOR", "CGIAR"]
        },
        {
            name: "CGIAR Challenge Program on Water and Food (CPWF)",
            hashtags: ["CPWF"]
        },
        {
            name: "CGIAR Gender and Agriculture Research Network",
            hashtags: ["CGIAR", "gender"]
        },
        {
            name: "CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS)",
            hashtags: ["CCAFS"]
        },
        {
            name: "CGIAR Research Program on Dryland Systems",
            hashtags: ["CGIAR", "drylands"]
        },
        {
            name: "CGIAR Research Program on Livestock and Fish",
            hashtags: ["CGIAR", "livestock", "fish"]
        },
        {
            name: "CGIAR Research Program on Water, Land and Ecosystems (WLE)",
            hashtags: ["CGIAR", "WLE"]
        },
        {
            name: "CGIAR System-wide Livestock Programme",
            hashtags: ["CGIAR", "livestock"]
        },
        {
            name: "East Africa Dairy Development Project",
            hashtags: ["EADD", "dairying"]
        },
        {
            name: "Feed the Future Innovation Lab for Small-Scale Irrigation",
            hashtags: ["ILSSI", "irrigation"]
        },
        {
            name: "Humidtropics, a CGIAR Research Program",
            hashtags: ["CGIAR", "humidtropics"]
        },
        {
            name: "IGAD Livestock Policy Initiative",
            hashtags: ["IGAD", "livestock"]
        },
        {
            name: "International Center for Agricultural Research in the Dry Areas (ICARDA)",
            hashtags: ["ICARDA", "drylands"]
        },
        {
            name: "International Center for Tropical Agriculture (CIAT)",
            hashtags: ["CIAT", "CGIAR"]
        },
        {
            name: "International Institute of Tropical Agriculture (IITA)",
            hashtags: ["IITA", "CGIAR"]
        },
        {
            name: "International Livestock Research Institute (ILRI)",
            hashtags: ["ILRI", "livestock"]
        },
        {
            name: "International Potato Center (CIP)",
            hashtags: ["CIP", "potato"]
        },
        {
            name: "International Water Management Institute (IWMI)",
            hashtags: ["IWMI", "CGIAR"]
        },
        {
            name: "Livestock and Irrigation Value Chains for Ethiopian Smallholders (LIVES)",
            hashtags: ["ILRI", "ethiopia"]
        },
        {
            name: "Technical Centre for Agricultural and Rural Cooperation (CTA)",
            mentions: ["CTAflash"]
        },
        {
            name: "Technical Consortium for Building Resilience to Drought in the Horn of Africa",
            hashtags: ["CGIAR", "IGAD"]
        }
    ];

    // Add to database if not already available
    _.each(communities, function(community){
        if(Communities.find({name: community.name}).count() == 0){
            Communities.insert(community);
        }
    });

});
