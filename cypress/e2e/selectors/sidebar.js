import { Assembly } from "../pages/components/assembly";

export default {
  productDropDownText: '.custom-dropdown .dropbtn span',
  productOrCmpInDropdown: '//div[@id = "myDropdown"]/a[contains(text(),"prodName")]',
  listItem: '.nav-list div.ps>div>ul>li>div>span>span>span',
  assemblyListItem: '//li[@class="have-child"]/div/ul/li/div/span',
  expandChildIcon: '//ul/li/div/span//span[text()="name/cpn"]/ancestor::li[@class="have-child"]//div[@class="ui-icon "]',
  assemblyCount: '.assembly-ul-list-inner'
} 
